// ===== Dashboard (Home) - Foundify =====

// --- 1) Auth Guard: hanya bisa akses jika login ---
function getAuth() {
  const raw = localStorage.getItem("foundify_auth");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireAuth() {
  const auth = getAuth();
  if (!auth || !auth.token) {
    window.location.href = "../pages/login.html";
    return null;
  }
  return auth;
}

const auth = requireAuth();
if (auth) {
  const userPillText = document.getElementById("userPillText");
  if (userPillText) {
    userPillText.textContent = `${auth.username || "user"} (${auth.role || "user"})`;
  }
}

// --- 2) Dummy data items + kategori/deskripsi ---
const categories = ["Aksesoris", "Dokumen", "Elektronik", "Pakaian", "Lainnya"];
const places = [
  "Parkiran Motor, Area 1",
  "Perpustakaan, Area 2",
  "Taman, Area 2",
  "Kantin, Area 3",
  "Masjid, Area 1",
  "Lobby, Area 2"
];

const ITEM_MASTER = {
  Aksesoris: {
    LOST: [
      { title: "Kehilangan Jam Tangan", desc: "Jam tangan warna hitam, tali karet, kemungkinan terjatuh." },
      { title: "Kehilangan Kacamata", desc: "Kacamata minus frame hitam, terakhir terlihat di area umum." },
      { title: "Kehilangan Cincin", desc: "Cincin perak polos, hilang setelah kegiatan." },
    ],
    FOUND: [
      { title: "Ditemukan Gelang", desc: "Gelang stainless ditemukan di area sekitar." },
      { title: "Ditemukan Kalung", desc: "Kalung rantai tipis tanpa liontin." },
      { title: "Ditemukan Jam Tangan", desc: "Jam tangan analog, kondisi baik." },
    ],
  },
  Dokumen: {
    LOST: [
      { title: "Kehilangan KTP", desc: "KTP kemungkinan tercecer, mohon dikembalikan jika ditemukan." },
      { title: "Kehilangan SIM", desc: "SIM C hilang, terakhir dibawa saat bepergian." },
      { title: "Kehilangan Kartu Mahasiswa", desc: "KTM universitas, hilang setelah jam kuliah." },
    ],
    FOUND: [
      { title: "Ditemukan Kartu Mahasiswa", desc: "Kartu mahasiswa ditemukan di area kampus." },
      { title: "Ditemukan KTP", desc: "KTP ditemukan, bisa diklaim dengan bukti identitas." },
      { title: "Ditemukan SIM", desc: "SIM ditemukan dalam kondisi baik." },
    ],
  },
  Elektronik: {
    LOST: [
      { title: "Kehilangan HP", desc: "HP Android warna hitam, casing transparan." },
      { title: "Kehilangan Charger", desc: "Charger USB-C warna putih, kemungkinan tertinggal." },
      { title: "Kehilangan Earphone", desc: "Earphone kabel, terselip di sekitar lokasi." },
    ],
    FOUND: [
      { title: "Ditemukan Power Bank", desc: "Power bank 10.000mAh warna hitam." },
      { title: "Ditemukan Charger", desc: "Charger ditemukan, silakan klaim dengan bukti." },
      { title: "Ditemukan Earphone", desc: "Earphone ditemukan di kursi/area umum." },
    ],
  },
  Pakaian: {
    LOST: [
      { title: "Kehilangan Jaket", desc: "Jaket hoodie warna abu-abu." },
      { title: "Kehilangan Topi", desc: "Topi hitam tanpa logo." },
      { title: "Kehilangan Sweater", desc: "Sweater warna coklat, kemungkinan tertinggal." },
    ],
    FOUND: [
      { title: "Ditemukan Jaket", desc: "Jaket parasut warna biru." },
      { title: "Ditemukan Topi", desc: "Topi ditemukan di area umum." },
      { title: "Ditemukan Sweater", desc: "Sweater rajut ditemukan, kondisi baik." },
    ],
  },
  Lainnya: {
    LOST: [
      { title: "Kehilangan Botol Minum", desc: "Botol minum stainless warna biru." },
      { title: "Kehilangan Helm", desc: "Helm full face warna hitam." },
      { title: "Kehilangan Kunci", desc: "Gantungan kunci warna merah, berisi beberapa kunci." },
    ],
    FOUND: [
      { title: "Ditemukan Helm", desc: "Helm standar SNI ditemukan di parkiran." },
      { title: "Ditemukan Botol Minum", desc: "Botol minum plastik warna hijau." },
      { title: "Ditemukan Kunci", desc: "Kunci ditemukan, bisa diklaim dengan ciri-ciri." },
    ],
  },
};

function formatDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
}

function makeItems(count = 36) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const isLost = i % 2 === 0;
    const cat = categories[i % categories.length];
    const status = isLost ? "LOST" : "FOUND";
    const pool = ITEM_MASTER[cat][status];
    const pick = pool[i % pool.length];

    const loc = places[i % places.length];
    const dt = new Date();
    dt.setDate(dt.getDate() - (i % 15));

    items.push({
      id: `dummy-${i}`,
      status,
      title: `${pick.title} #${i}`,
      description: pick.desc,
      category: cat,
      location: loc,
      date: formatDate(dt),
      author: "system",
      coins: (i % 5 + 1) * 10,
      image: null,
      source: "dummy"
    });
  }
  return items;
}

// --- localStorage helpers ---
function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function getReports() {
  // report.js menyimpan di foundify_reports
  return readJSON("foundify_reports", []);
}

// --- 3) Gabungkan dummy + laporan user ---
function buildAllItems() {
  const dummy = makeItems(36);
  const reports = getReports().map(r => ({
    id: r.id,                       // numeric timestamp
    status: r.status,
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    date: new Date(r.date).toLocaleDateString("en-US", { month:"short", day:"2-digit" }).replace(",", ""),
    author: r.author,
    coins: r.coins ?? 10,
    image: r.image || null,
    source: "report"
  }));
  // report paling baru di atas
  return [...reports, ...dummy];
}

let ALL_ITEMS = buildAllItems();

// --- 4) DOM Refs ---
const grid = document.getElementById("itemsGrid");
const resultMeta = document.getElementById("resultMeta");
const btnLoadMore = document.getElementById("btnLoadMore");

const statusSelect = document.getElementById("statusSelect");
const locationInput = document.getElementById("locationInput");
const btnSearch = document.getElementById("btnSearch");

const globalSearch = document.getElementById("globalSearch");
const globalSearchBtn = document.getElementById("globalSearchBtn");

// --- 5) Pagination ---
let pageSize = 9;
let page = 1;

// Filter state
let currentFilters = { category: null, q: "" };

function getStatusFilter() {
  return (statusSelect?.value || "ALL").toUpperCase().trim();
}
function getLocationFilter() {
  return (locationInput?.value || "").toLowerCase().trim();
}
function getQueryFilter() {
  return (currentFilters.q || "").toLowerCase().trim();
}

function applyFilters(items) {
  const statusFilter = getStatusFilter();
  const locFilter = getLocationFilter();
  const qFilter = getQueryFilter();
  const catFilter = currentFilters.category;

  return items.filter((it) => {
    const itemStatus = (it.status || "").toUpperCase();

    const okStatus = statusFilter === "ALL" ? true : itemStatus === statusFilter;
    const okLoc = locFilter ? it.location.toLowerCase().includes(locFilter) : true;

    const okQ = qFilter
      ? (
          it.title.toLowerCase().includes(qFilter) ||
          (it.description || "").toLowerCase().includes(qFilter) ||
          it.location.toLowerCase().includes(qFilter) ||
          it.category.toLowerCase().includes(qFilter)
        )
      : true;

    const okCat = catFilter ? it.category === catFilter : true;
    return okStatus && okLoc && okQ && okCat;
  });
}

function cardTemplate(item) {
  const isFound = item.status === "FOUND";
  const badgeClass = isFound ? "badge badge--found" : "badge";
  const badgeText = isFound ? "FOUND" : "LOST";

  return `
    <article class="card" data-id="${item.id}">
      <div class="card__img" aria-hidden="true">
        ${
          item.image
            ? `<img src="${item.image}" alt="Gambar item" style="width:100%;height:100%;object-fit:cover;display:block;" />`
            : `
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="currentColor" stroke-width="1.6"/>
                <path d="M8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" fill="currentColor"/>
                <path d="M21 16L16 11L5 21" stroke="currentColor" stroke-width="1.6"/>
              </svg>
            `
        }
      </div>

      <div class="card__body">
        <div class="card__top">
          <span class="${badgeClass}">${badgeText}</span>
          <span class="date">${item.date}</span>
        </div>

        <h3 class="title">${item.title}</h3>

        <div class="meta" style="margin-bottom:6px;">
          <span class="meta__icon">🏷️</span>
          <span>${item.category}</span>
        </div>

        <div class="meta" style="align-items:flex-start;">
          <span class="meta__icon">📝</span>
          <span style="line-height:1.35;">${item.description || "-"}</span>
        </div>

        <div class="meta">
          <span class="meta__icon">📍</span>
          <span>${item.location}</span>
        </div>

        <div class="card__bottom">
          <div class="author">
            <span aria-hidden="true">👤</span>
            <span>${item.author}</span>
          </div>
          <div class="coins">${item.coins} Coins</div>
        </div>
      </div>
    </article>
  `;
}

function render() {
  // rebuild agar report baru langsung kebaca (kalau balik dari report.html)
  ALL_ITEMS = buildAllItems();

  const filtered = applyFilters(ALL_ITEMS);
  const visible = filtered.slice(0, page * pageSize);

  grid.innerHTML = visible.map(cardTemplate).join("");
  resultMeta.textContent = `Menampilkan ${visible.length} dari ${filtered.length} item`;
  btnLoadMore.style.display = visible.length >= filtered.length ? "none" : "inline-flex";
}

// --- 6) Events ---
statusSelect.addEventListener("change", () => { page = 1; render(); });
btnSearch.addEventListener("click", () => { page = 1; render(); });

globalSearchBtn.addEventListener("click", () => {
  currentFilters.q = globalSearch.value.trim();
  page = 1;
  render();
});
globalSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    currentFilters.q = e.target.value.trim();
    page = 1;
    render();
  }
});

btnLoadMore.addEventListener("click", () => { page += 1; render(); });

document.querySelectorAll(".cat").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.getAttribute("data-cat");
    currentFilters.category = (currentFilters.category === cat) ? null : cat;
    page = 1;
    render();
  });
});

// Logout
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
});

// Klik card -> buka detail
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.getAttribute("data-id");
  window.location.href = `./detail.html?id=${encodeURIComponent(id)}`;
});

// initial render
render();
