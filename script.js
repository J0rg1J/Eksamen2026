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

function fullforBestilling() {
  if (handlekurv.length === 0) {
    alert("Du må legge til minst ett produkt før du kan bestille.");
    return;
  }

  alert("Bestilling fullført! Senere kan denne lagres i en SQL-database.");
  handlekurv.length = 0;
  visHandlekurv();
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
