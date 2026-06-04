const supabaseUrl = "https://vkuplcldclmcfcbtdlgf.supabase.co";
const supabaseKey = "sb_publishable_8e_elINpvMIHGBLTdzzd0g_mzRXXS0K";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let produkter = [];
const handlekurv = [];

async function hentProdukterFraSupabase() {
  const productList = document.getElementById("productList");

  productList.innerHTML = "<p>Laster produkter...</p>";

  const { data, error } = await supabaseClient
    .from("produkter")
    .select("*")
    .order("navn", { ascending: true });

  console.log("Supabase data:", data);
  console.log("Supabase error:", error);

  if (error) {
    productList.innerHTML = "<p>Kunne ikke hente produkter fra databasen.</p>";
    console.error("Feil ved henting av produkter:", error);
    return;
  }

  if (!data || data.length === 0) {
    productList.innerHTML = "<p>Ingen produkter ligger i databasen.</p>";
    return;
  }

  produkter = data;
  visProdukter();
}

function visProdukter() {
  const productList = document.getElementById("productList");
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  const filtrerteProdukter = produkter.filter((produkt) => {
    const matcherSok = produkt.navn.toLowerCase().includes(searchInput);
    const matcherKategori =
      categoryFilter === "alle" || produkt.kategori === categoryFilter;

    return matcherSok && matcherKategori;
  });

  if (filtrerteProdukter.length === 0) {
    productList.innerHTML = "<p>Ingen produkter funnet.</p>";
    return;
  }

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

function leggTilIHandlekurv(produktId) {
  const produkt = produkter.find((item) => item.id === produktId);

  if (!produkt) {
    return;
  }

  handlekurv.push(produkt);
  visHandlekurv();
}

function visHandlekurv() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (handlekurv.length === 0) {
    cartItems.innerHTML = "<p>Handlekurven er tom.</p>";
    cartTotal.textContent = "Total: 0 kr";
    return;
  }

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

  cartItems.innerHTML = cartHtml;

  const total = handlekurv.reduce((sum, produkt) => sum + produkt.pris, 0);
  cartTotal.textContent = `Total: ${total} kr`;
}

function fjernFraHandlekurv(index) {
  handlekurv.splice(index, 1);
  visHandlekurv();
}

async function fullforBestilling() {
  const customerName = document.getElementById("customerName").value.trim();
  const orderMessage = document.getElementById("orderMessage");
  const customerEmail = document.getElementById("customerEmail").value.trim();
  const customerAddress = document
    .getElementById("customerAddress")
    .value.trim();

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

  const { error } = await supabaseClient.from("orders").insert({
    customer_name: customerName,
    customer_email: customerEmail,
    customer_address: customerAddress,
    total_price: total,
    items: orderItems,
  });

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

function scrollTilProdukter() {
  document.getElementById("produkter").scrollIntoView({
    behavior: "smooth",
  });
}

function init() {
  document
    .getElementById("searchInput")
    .addEventListener("input", visProdukter);

  document
    .getElementById("categoryFilter")
    .addEventListener("change", visProdukter);

  document
    .getElementById("checkoutButton")
    .addEventListener("click", fullforBestilling);

  document
    .getElementById("scrollButton")
    .addEventListener("click", scrollTilProdukter);

  document.getElementById("productList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    const produktId = Number(button.dataset.id);
    leggTilIHandlekurv(produktId);
  });

  document.getElementById("cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button) return;

    const index = Number(button.dataset.index);
    fjernFraHandlekurv(index);
  });

  hentProdukterFraSupabase();
  visHandlekurv();
}

document.addEventListener("DOMContentLoaded", init);
