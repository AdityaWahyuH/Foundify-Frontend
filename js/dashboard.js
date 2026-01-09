// ===== Dashboard (Home) - Foundify =====
import { requireAuth, logout } from "./utils.js";

// --- 1) Auth Guard: hanya bisa akses jika login ---
const auth = requireAuth();
if (!auth) {
  // requireAuth sudah redirect
  throw new Error("Unauthorized");
}

// Topbar user
const userPillText = document.getElementById("userPillText");
if (userPillText) {
  userPillText.textContent = `${auth.username || "user"} (${auth.role || "user"})`;
}

// Show admin menus if role admin
if (auth.role === "admin") {
  const a1 = document.getElementById("adminClaimsLink");
  const a2 = document.getElementById("adminRewardsLink");
  const a3 = document.getElementById("adminRedeemLink");
  if (a1) a1.style.display = "flex";
  if (a2) a2.style.display = "flex";
  if (a3) a3.style.display = "flex";
}

// Logout
document.getElementById("btnLogout").addEventListener("click", logout);

// --- 2) Dummy data items: kategori & deskripsi sesuai ---
const categories = ["Aksesoris", "Dokumen", "Elektronik", "Pakaian", "Lainnya"];
const places = [
  "Parkiran Motor, Area 1",
  "Perpustakaan, Area 2",
  "Taman, Area 2",
  "Kantin, Area 3",
  "Masjid, Area 1",
  "Lobby, Area 2"
];

const categoryTemplates = {
  Aksesoris: {
    lost: [
      { t: "Kehilangan Cincin", d: "Cincin perak kecil, kemungkinan jatuh saat aktivitas." },
      { t: "Kehilangan Jam Tangan", d: "Jam tangan analog, strap hitam, terakhir terlihat sore." },
      { t: "Kehilangan Kalung", d: "Kalung rantai tipis warna silver, mohon dibantu." }
    ],
    found: [
      { t: "Ditemukan Gelang", d: "Gelang rantai kecil ditemukan dekat area umum." },
      { t: "Ditemukan Jam Tangan", d: "Jam tangan ditemukan di bangku, kondisi masih bagus." },
      { t: "Ditemukan Cincin", d: "Cincin ditemukan di lantai, diamankan untuk pemilik." }
    ],
  },
  Dokumen: {
    lost: [
      { t: "Kehilangan Kartu Mahasiswa", d: "KTM atas nama belum diketahui, butuh segera." },
      { t: "Kehilangan STNK", d: "STNK motor tertinggal, kemungkinan di parkiran." },
      { t: "Kehilangan Dompet Berisi KTP", d: "Dompet berisi identitas, mohon info jika menemukan." }
    ],
    found: [
      { t: "Ditemukan Kartu Mahasiswa", d: "KTM ditemukan di lorong, diamankan di admin." },
      { t: "Ditemukan KTP", d: "KTP ditemukan dekat kantin, siap diverifikasi." },
      { t: "Ditemukan Surat Kendaraan", d: "Dokumen kendaraan ditemukan, mohon klaim dengan bukti." }
    ],
  },
  Elektronik: {
    lost: [
      { t: "Kehilangan Earphone", d: "Earphone TWS warna putih, kemungkinan tertinggal." },
      { t: "Kehilangan Charger", d: "Charger HP tertinggal di meja, kabel putih." },
      { t: "Kehilangan HP", d: "HP hilang, terakhir digunakan di area kampus." }
    ],
    found: [
      { t: "Ditemukan Earphone", d: "Earphone ditemukan di kursi, sudah diamankan." },
      { t: "Ditemukan Charger", d: "Charger ditemukan di stop kontak, silakan klaim." },
      { t: "Ditemukan Powerbank", d: "Powerbank ditemukan di perpustakaan, kondisi normal." }
    ],
  },
  Pakaian: {
    lost: [
      { t: "Kehilangan Jaket", d: "Jaket warna gelap, tertinggal saat kegiatan." },
      { t: "Kehilangan Helm", d: "Helm tertinggal di area parkir, mohon konfirmasi." },
      { t: "Kehilangan Topi", d: "Topi warna hitam, kemungkinan jatuh di jalan." }
    ],
    found: [
      { t: "Ditemukan Jaket", d: "Jaket ditemukan di kursi, diamankan sementara." },
      { t: "Ditemukan Helm", d: "Helm ditemukan di parkiran, siap diverifikasi." },
      { t: "Ditemukan Hoodie", d: "Hoodie ditemukan di lobby, mohon klaim dengan bukti." }
    ],
  },
  Lainnya: {
    lost: [
      { t: "Kehilangan Botol Minum", d: "Botol minum tertinggal, warna netral, mohon dibantu." },
      { t: "Kehilangan Kunci", d: "Kunci motor/rumah hilang, kemungkinan jatuh." },
      { t: "Kehilangan Payung", d: "Payung lipat tertinggal setelah hujan." }
    ],
    found: [
      { t: "Ditemukan Botol Minum", d: "Botol minum ditemukan di meja, diamankan." },
      { t: "Ditemukan Kunci", d: "Kunci ditemukan di lantai, silakan klaim." },
      { t: "Ditemukan Payung", d: "Payung lipat ditemukan, bisa diambil setelah verifikasi." }
    ],
  }
};

function formatDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
}

function pickFrom(arr, i) {
  return arr[i % arr.length];
}

function makeItems(count = 60) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const isLost = i % 2 === 0;
    const category = categories[i % categories.length];
    const loc = places[i % places.length];
    const templatePool = isLost ? categoryTemplates[category].lost : categoryTemplates[category].found;
    const tpl = pickFrom(templatePool, i);

    const dt = new Date();
    dt.setDate(dt.getDate() - (i % 15));

    items.push({
      id: i,
      status: isLost ? "LOST" : "FOUND",
      title: `${tpl.t} #${i}`,
      description: tpl.d,
      category,
      location: loc,
      date: formatDate(dt),
      author: (auth && auth.username) ? auth.username : "user",
      coins: (i % 5 + 1) * 10,
      image: null,
    });
  }
  return items;
}

let ALL_ITEMS = makeItems(60);

// --- 3) DOM Refs ---
const grid = document.getElementById("itemsGrid");
const resultMeta = document.getElementById("resultMeta");
const btnLoadMore = document.getElementById("btnLoadMore");

const statusSelect = document.getElementById("statusSelect");
const locationInput = document.getElementById("locationInput");
const btnSearch = document.getElementById("btnSearch");

const globalSearch = document.getElementById("globalSearch");
const globalSearchBtn = document.getElementById("globalSearchBtn");

// --- 4) Pagination + Filter State ---
let pageSize = 9;
let page = 1;

let currentFilters = {
  category: null,
  q: "",
};

function getStatusFilter() {
  return (statusSelect?.value || "ALL").toUpperCase().trim(); // ALL/FOUND/LOST
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

    // ✅ Status filter fix
    const okStatus = statusFilter === "ALL" ? true : itemStatus === statusFilter;

    // lokasi
    const okLoc = locFilter ? it.location.toLowerCase().includes(locFilter) : true;

    // global search (title/desc/location/category)
    const okQ = qFilter
      ? (
          it.title.toLowerCase().includes(qFilter) ||
          (it.description || "").toLowerCase().includes(qFilter) ||
          it.location.toLowerCase().includes(qFilter) ||
          it.category.toLowerCase().includes(qFilter)
        )
      : true;

    // kategori sidebar
    const okCat = catFilter ? it.category === catFilter : true;

    return okStatus && okLoc && okQ && okCat;
  });
}

// Card template (tambah deskripsi)
function cardTemplate(item) {
  const isFound = item.status === "FOUND";
  const badgeClass = isFound ? "badge badge--found" : "badge";
  const badgeText = isFound ? "FOUND" : "LOST";

  // Deskripsi singkat (agar rapi)
  const desc = (item.description || "").trim();
  const shortDesc = desc.length > 70 ? desc.slice(0, 70) + "..." : desc;

  return `
    <article class="card" data-id="${item.id}">
      <div class="card__img" aria-hidden="true">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
          <path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="currentColor" stroke-width="1.6"/>
          <path d="M8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" fill="currentColor"/>
          <path d="M21 16L16 11L5 21" stroke="currentColor" stroke-width="1.6"/>
        </svg>
      </div>

      <div class="card__body">
        <div class="card__top">
          <span class="${badgeClass}">${badgeText}</span>
          <span class="date">${item.date}</span>
        </div>

        <h3 class="title">${item.title}</h3>

        <div class="meta">
          <span class="meta__icon">📍</span>
          <span>${item.location}</span>
        </div>

        <div class="meta" style="margin-top:6px;">
          <span class="meta__icon">🏷️</span>
          <span>${item.category}</span>
        </div>

        <div class="meta" style="margin-top:6px;">
          <span class="meta__icon">📝</span>
          <span>${shortDesc}</span>
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
  const filtered = applyFilters(ALL_ITEMS);
  const visible = filtered.slice(0, page * pageSize);

  grid.innerHTML = visible.map(cardTemplate).join("");
  resultMeta.textContent = `Menampilkan ${visible.length} dari ${filtered.length} item`;

  btnLoadMore.style.display = visible.length >= filtered.length ? "none" : "inline-flex";
}

// --- 5) Events ---
statusSelect.addEventListener("change", () => {
  page = 1;
  render();
});

btnSearch.addEventListener("click", () => {
  page = 1;
  render();
});

// Global search
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

// Load more
btnLoadMore.addEventListener("click", () => {
  page += 1;
  render();
});

// Filter kategori sidebar
document.querySelectorAll(".cat").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.getAttribute("data-cat");
    currentFilters.category = (currentFilters.category === cat) ? null : cat;
    page = 1;
    render();
  });
});

// Klik card -> detail placeholder
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.getAttribute("data-id");
  alert(`Buka detail item ID: ${id} (halaman detail next step)`);
});

// initial render
render();
