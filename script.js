const produkter = [
  {
    id: 1,
    navn: "Nordisk Sofa",
    kategori: "stue",
    pris: 7990,
    ikon: "🛋️",
    beskrivelse: "Komfortabel sofa med moderne nordisk design.",
  },
  {
    id: 2,
    navn: "Eik Spisebord",
    kategori: "spisestue",
    pris: 5490,
    ikon: "🍽️",
    beskrivelse: "Solid spisebord i eik med plass til seks personer.",
  },
  {
    id: 3,
    navn: "Ergo Kontorstol",
    kategori: "kontor",
    pris: 2490,
    ikon: "🪑",
    beskrivelse: "Justerbar kontorstol for hjemmekontor.",
  },
  {
    id: 4,
    navn: "Lun Seng",
    kategori: "soverom",
    pris: 8990,
    ikon: "🛏️",
    beskrivelse: "Behagelig seng med minimalistisk design.",
  },
  {
    id: 5,
    navn: "TV-benk Oslo",
    kategori: "stue",
    pris: 3290,
    ikon: "📺",
    beskrivelse: "Praktisk TV-benk med god lagringsplass.",
  },
  {
    id: 6,
    navn: "Skrivebord Compact",
    kategori: "kontor",
    pris: 1990,
    ikon: "💻",
    beskrivelse: "Lite skrivebord som passer godt til små rom.",
  },
];

const handlekurv = [];

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
      (produkt) => `
        <div class="cart-item">
          <span>${produkt.navn}</span>
          <span>${produkt.pris} kr</span>
        </div>
      `,
    )
    .join("");

  cartItems.innerHTML = cartHtml;
  const total = handlekurv.reduce((sum, produkt) => sum + produkt.pris, 0);
  cartTotal.textContent = `Total: ${total} kr`;
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

  visProdukter();
  visHandlekurv();
}

document.addEventListener("DOMContentLoaded", init);
