javascript;
// Koblingsinformasjon til Supabase-prosjektet.
// URL-en peker til databasen, og nøkkelen brukes for å kunne hente og lagre data fra frontend.
const supabaseUrl = "https://vkuplcldclmcfcbtdlgf.supabase.co";
const supabaseKey = "sb_publishable_8e_elINpvMIHGBLTdzzd0g_mzRXXS0K";

// Lager en Supabase-klient som resten av koden bruker for å kommunisere med databasen.
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Arrayen produkter lagrer produktene som hentes fra databasen.
// Handlekurv-arrayen lagrer produktene brukeren legger i handlekurven.
let produkter = [];
const handlekurv = [];

// Henter produkter fra Supabase-databasen og viser dem på nettsiden.
async function hentProdukterFraSupabase() {
  const productList = document.getElementById("productList");

  // Viser en midlertidig melding mens produktene lastes inn.
  productList.innerHTML = "<p>Laster produkter...</p>";

  // Henter alle produkter fra tabellen "produkter" og sorterer dem alfabetisk etter navn.
  const { data, error } = await supabaseClient
    .from("produkter")
    .select("*")
    .order("navn", { ascending: true });

  // Hvis det oppstår en feil ved henting av produkter, vises en feilmelding til brukeren.
  if (error) {
    productList.innerHTML = "<p>Kunne ikke hente produkter fra databasen.</p>";
    console.error("Feil ved henting av produkter:", error);
    return;
  }

  // Hvis databasen ikke inneholder produkter, vises en egen melding.
  if (!data || data.length === 0) {
    productList.innerHTML = "<p>Ingen produkter ligger i databasen.</p>";
    return;
  }

  // Lagrer produktene fra databasen i produkter-arrayen og viser dem på nettsiden.
  produkter = data;
  visProdukter();
}

// Viser produktene på nettsiden, basert på søk og valgt kategori.
function visProdukter() {
  const productList = document.getElementById("productList");

  // Henter søketeksten fra inputfeltet og gjør den om til små bokstaver.
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();

  // Henter valgt kategori fra nedtrekksmenyen.
  const categoryFilter = document.getElementById("categoryFilter").value;

  // Filtrerer produktene slik at bare produkter som matcher søk og kategori vises.
  const filtrerteProdukter = produkter.filter((produkt) => {
    const matcherSok = produkt.navn.toLowerCase().includes(searchInput);
    const matcherKategori =
      categoryFilter === "alle" || produkt.kategori === categoryFilter;

    return matcherSok && matcherKategori;
  });

  // Hvis ingen produkter matcher søket eller filteret, vises en melding.
  if (filtrerteProdukter.length === 0) {
    productList.innerHTML = "<p>Ingen produkter funnet.</p>";
    return;
  }

  // Lager HTML-kort for hvert filtrerte produkt og legger dem inn i produktlisten.
  productList.innerHTML = filtrerteProdukter
    .map(
      (produkt) => `
        <article class="product-card">
          <div>
            <div class="product-image">${produkt.ikon}</div>
            <h3>${produkt.navn}</h3>
            <p>${produkt.beskrivelse}</p>
            <p class="price">${produkt.pris} kr</p>
          </div>
          <button type="button" data-id="${produkt.id}">
            Legg i handlekurv
          </button>
        </article>
      `,
    )
    .join("");
}

// Legger et valgt produkt i handlekurven basert på produktets id.
function leggTilIHandlekurv(produktId) {
  // Finner produktet i produkter-arrayen.
  const produkt = produkter.find((item) => item.id === produktId);

  // Hvis produktet ikke finnes, stoppes funksjonen.
  if (!produkt) {
    return;
  }

  // Legger produktet i handlekurven og oppdaterer visningen av handlekurven.
  handlekurv.push(produkt);
  visHandlekurv();
}

// Viser innholdet i handlekurven og regner ut totalprisen.
function visHandlekurv() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  // Hvis handlekurven er tom, vises standardtekst og totalen settes til 0 kr.
  if (handlekurv.length === 0) {
    cartItems.innerHTML = "<p>Handlekurven er tom.</p>";
    cartTotal.textContent = "Total: 0 kr";
    return;
  }

  // Lager HTML for hvert produkt i handlekurven, inkludert en fjern-knapp.
  const cartHtml = handlekurv
    .map(
      (produkt, index) => `
        <div class="cart-item">
          <span>${produkt.navn}</span>
          <span>${produkt.pris} kr</span>
          <button type="button" data-index="${index}">
            Fjern
          </button>
        </div>
      `,
    )
    .join("");

  // Viser handlekurvproduktene på nettsiden.
  cartItems.innerHTML = cartHtml;

  // Regner ut totalprisen ved å legge sammen prisen på alle produktene i handlekurven.
  const total = handlekurv.reduce((sum, produkt) => sum + produkt.pris, 0);

  // Oppdaterer totalprisen i handlekurven.
  cartTotal.textContent = `Total: ${total} kr`;
}

// Fjerner et produkt fra handlekurven basert på plasseringen produktet har i arrayen.
function fjernFraHandlekurv(index) {
  // Fjerner ett produkt fra handlekurven.
  handlekurv.splice(index, 1);

  // Oppdaterer handlekurven etter at produktet er fjernet.
  visHandlekurv();
}

// Kontrollerer kundeinformasjon og lagrer bestillingen i Supabase.

async function fullforBestilling() {
  const customerName = document.getElementById("customerName").value.trim();
  const customerEmail = document.getElementById("customerEmail").value.trim();
  const customerAddress = document
    .getElementById("customerAddress")
    .value.trim();

  const orderMessage = document.getElementById("orderMessage");
  const checkoutButton = document.getElementById("checkoutButton");

  if (handlekurv.length === 0) {
    orderMessage.className = "error-message";
    orderMessage.textContent =
      "Du må legge til minst ett produkt før du kan bestille.";
    return;
  }

  if (!customerName || !customerEmail || !customerAddress) {
    orderMessage.className = "error-message";
    orderMessage.textContent = "Du må fylle inn navn, e-post og adresse.";
    return;
  }

  if (!customerEmail.includes("@")) {
    orderMessage.className = "error-message";
    orderMessage.textContent = "Du må skrive inn en gyldig e-postadresse.";
    return;
  }

  const total = handlekurv.reduce((sum, produkt) => sum + produkt.pris, 0);

  const orderItems = handlekurv.map((produkt) => {
    return {
      id: produkt.id,
      navn: produkt.navn,
      pris: produkt.pris,
    };
  });

  checkoutButton.disabled = true;
  orderMessage.className = "";
  orderMessage.textContent = "Lagrer bestilling...";

  const { error } = await supabaseClient.from("orders").insert({
    customer_name: customerName,
    customer_email: customerEmail,
    customer_address: customerAddress,
    total_price: total,
    items: orderItems,
  });

  checkoutButton.disabled = false;

  if (error) {
    console.error("Feil ved lagring av ordre:", error);
    orderMessage.className = "error-message";
    orderMessage.textContent = "Bestillingen kunne ikke lagres.";
    return;
  }

  orderMessage.className = "success-message";
  orderMessage.textContent = `Takk for bestillingen, ${customerName}. Ordren er lagret.`;

  handlekurv.length = 0;
  visHandlekurv();

  document.getElementById("customerName").value = "";
  document.getElementById("customerEmail").value = "";
  document.getElementById("customerAddress").value = "";
}

// Sender brukeren ned til produktseksjonen med jevn scrolling.
function scrollTilProdukter() {
  document.getElementById("produkter").scrollIntoView({
    behavior: "smooth",
  });
}

// Starter opp funksjonaliteten på nettsiden og kobler knapper/felter til riktige funksjoner.
function init() {
  // Kjører visProdukter hver gang brukeren skriver i søkefeltet.
  document
    .getElementById("searchInput")
    .addEventListener("input", visProdukter);

  // Kjører visProdukter når brukeren endrer kategori.
  document
    .getElementById("categoryFilter")
    .addEventListener("change", visProdukter);

  // Kjører fullforBestilling når brukeren trykker på bestillingsknappen.
  document
    .getElementById("checkoutButton")
    .addEventListener("click", fullforBestilling);

  // Kjører scrollTilProdukter når brukeren trykker på "Se produkter"-knappen.
  document
    .getElementById("scrollButton")
    .addEventListener("click", scrollTilProdukter);

  // Bruker event delegation for produktlisten, slik at knapper som lages dynamisk også fungerer.
  document.getElementById("productList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    const produktId = Number(button.dataset.id);
    leggTilIHandlekurv(produktId);
  });

  // Bruker event delegation for handlekurven, slik at fjern-knappene fungerer for dynamisk innhold.
  document.getElementById("cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button) return;

    const index = Number(button.dataset.index);
    fjernFraHandlekurv(index);
  });

  // Henter produktene fra databasen når siden starter.
  hentProdukterFraSupabase();

  // Viser handlekurven fra start, slik at brukeren ser at den er tom.
  visHandlekurv();
}

// Sørger for at JavaScript-koden først starter når hele HTML-dokumentet er lastet inn.
document.addEventListener("DOMContentLoaded", init);
