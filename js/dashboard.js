// ===== Dashboard (Home) - Foundify =====
import { requireAuth, logout, readJSON } from "./utils.js";

/* ===============================
   1) AUTH & HEADER
================================ */
const auth = requireAuth();
if (!auth) throw new Error("Unauthorized");

document.getElementById("userPillText").textContent =
  `${auth.username || "user"} (${auth.role || "user"})`;

document.getElementById("btnLogout").addEventListener("click", logout);

// tampilkan menu admin
if (auth.role === "admin") {
  ["adminClaimsLink","adminRewardsLink","adminRedeemLink"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
  });
}

/* ===============================
   2) DATA LAPORAN USER (REAL)
================================ */
function getReportsFromStorage() {
  return readJSON("foundify_reports", []).map(r => ({
    id: r.id,
    status: (r.status || "LOST").toUpperCase(),
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    date: r.date || "—",
    author: r.author || "user",
    coins: r.coins || 10,
    image: r.image || null
  }));
}

/* ===============================
   3) DATA DUMMY (REALISTIS)
================================ */
const categories = ["Aksesoris","Dokumen","Elektronik","Pakaian","Lainnya"];
const places = [
  "Parkiran Motor, Area 1",
  "Perpustakaan, Area 2",
  "Taman, Area 2",
  "Kantin, Area 3",
  "Masjid, Area 1"
];

function formatDate(d) {
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
}

function makeDummyItems(count = 40) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const isLost = i % 2 === 0;
    const dt = new Date();
    dt.setDate(dt.getDate() - (i % 14));

    items.push({
      id: `DUMMY-${i}`,
      status: isLost ? "LOST" : "FOUND",
      title: `${isLost ? "Kehilangan" : "Ditemukan"} ${categories[i % categories.length]} #${i}`,
      description: "Ini adalah contoh data dummy untuk tampilan dashboard.",
      category: categories[i % categories.length],
      location: places[i % places.length],
      date: formatDate(dt),
      author: "system",
      coins: (i % 4 + 1) * 10,
      image: null
    });
  }
  return items;
}

/* ===============================
   4) GABUNGKAN DATA
================================ */
function buildAllItems() {
  return [
    ...getReportsFromStorage(), // laporan user paling atas
    ...makeDummyItems()
  ];
}

let ALL_ITEMS = buildAllItems();

/* ===============================
   5) DOM
================================ */
const grid = document.getElementById("itemsGrid");
const resultMeta = document.getElementById("resultMeta");
const btnLoadMore = document.getElementById("btnLoadMore");

const statusSelect = document.getElementById("statusSelect");
const locationInput = document.getElementById("locationInput");
const btnSearch = document.getElementById("btnSearch");

const globalSearch = document.getElementById("globalSearch");
const globalSearchBtn = document.getElementById("globalSearchBtn");

/* ===============================
   6) STATE
================================ */
let page = 1;
const pageSize = 9;

let filters = {
  category: null,
  q: ""
};

/* ===============================
   7) FILTER LOGIC
================================ */
function applyFilters(items) {
  const status = (statusSelect.value || "ALL").toUpperCase();
  const loc = (locationInput.value || "").toLowerCase();
  const q = filters.q.toLowerCase();
  const cat = filters.category;

  return items.filter(it => {
    const okStatus = status === "ALL" ? true : it.status === status;
    const okLoc = loc ? it.location.toLowerCase().includes(loc) : true;
    const okCat = cat ? it.category === cat : true;
    const okQ = q
      ? (
          it.title.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.location.toLowerCase().includes(q)
        )
      : true;

    return okStatus && okLoc && okCat && okQ;
  });
}

/* ===============================
   8) CARD TEMPLATE
================================ */
function cardTemplate(item) {
  const isFound = item.status === "FOUND";
  const badgeClass = isFound ? "badge badge--found" : "badge";

  return `
    <article class="card">
      <div class="card__img">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.title}">`
            : `<span style="font-size:32px;opacity:.5">📦</span>`
        }
      </div>

      <div class="card__body">
        <div class="card__top">
          <span class="${badgeClass}">${item.status}</span>
          <span class="date">${item.date}</span>
        </div>

        <h3 class="title">${item.title}</h3>

        <div class="meta">📍 ${item.location}</div>
        <div class="meta">🏷️ ${item.category}</div>
        <div class="meta">📝 ${item.description}</div>

        <div class="card__bottom">
          <span>👤 ${item.author}</span>
          <span class="coins">${item.coins} Coins</span>
        </div>
      </div>
    </article>
  `;
}

/* ===============================
   9) RENDER
================================ */
function render() {
  const filtered = applyFilters(ALL_ITEMS);
  const visible = filtered.slice(0, page * pageSize);

  grid.innerHTML = visible.map(cardTemplate).join("");
  resultMeta.textContent =
    `Menampilkan ${visible.length} dari ${filtered.length} item`;

  btnLoadMore.style.display =
    visible.length >= filtered.length ? "none" : "inline-flex";
}

/* ===============================
   10) EVENTS
================================ */
statusSelect.addEventListener("change", () => {
  page = 1;
  render();
});

btnSearch.addEventListener("click", () => {
  page = 1;
  render();
});

globalSearchBtn.addEventListener("click", () => {
  filters.q = globalSearch.value.trim();
  page = 1;
  render();
});

globalSearch.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    filters.q = e.target.value.trim();
    page = 1;
    render();
  }
});

btnLoadMore.addEventListener("click", () => {
  page++;
  render();
});

// kategori sidebar
document.querySelectorAll(".cat").forEach(btn => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.cat;
    filters.category = filters.category === cat ? null : cat;
    page = 1;
    render();
  });
});

// refresh jika balik dari report
window.addEventListener("focus", () => {
  ALL_ITEMS = buildAllItems();
  page = 1;
  render();
});

/* ===============================
   INIT
================================ */
render();
