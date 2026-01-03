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
    // belum login -> balik ke login
    window.location.href = "../pages/login.html";
    return null;
  }
  return auth;
}

const auth = requireAuth();
if (auth) {
  // tampilkan user/role di pill
  const userPillText = document.getElementById("userPillText");
  userPillText.textContent = `${auth.username || "user"} (${auth.role || "user"})`;
}

// --- 2) Dummy data items (banyak) ---
const categories = ["Aksesoris", "Dokumen", "Elektronik", "Pakaian", "Lainnya"];
const places = ["Parkiran Motor, Area 1", "Perpustakaan, Area 2", "Taman, Area 2", "Kantin, Area 3", "Masjid, Area 1", "Lobby, Area 2"];

function formatDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
}

function makeItems(count = 30) {
  const baseTitlesLost = ["Kehilangan Botol Minum", "Kehilangan Dompet", "Kehilangan Kunci", "Kehilangan HP", "Kehilangan Jaket"];
  const baseTitlesFound = ["Ditemukan Kartu Mahasiswa", "Ditemukan Dompet", "Ditemukan Charger", "Ditemukan Helm", "Ditemukan Kunci Motor"];

  const items = [];
  for (let i = 1; i <= count; i++) {
    const isLost = i % 2 === 0;
    const titleBase = isLost ? baseTitlesLost[i % baseTitlesLost.length] : baseTitlesFound[i % baseTitlesFound.length];
    const cat = categories[i % categories.length];
    const loc = places[i % places.length];

    const dt = new Date();
    dt.setDate(dt.getDate() - (i % 15));

    items.push({
      id: i,
      status: isLost ? "LOST" : "FOUND",
      title: `${titleBase} #${i}`,
      category: cat,
      location: loc,
      date: formatDate(dt),
      author: (auth && auth.username) ? auth.username : "admin",
      coins: (i % 5 + 1) * 10,
      image: null, // nanti dari upload user / backend
    });
  }
  return items;
}

// total data (banyak biar bisa scroll)
let ALL_ITEMS = makeItems(60);

// --- 3) Render + pagination simple (Load More) ---
const grid = document.getElementById("itemsGrid");
const resultMeta = document.getElementById("resultMeta");
const btnLoadMore = document.getElementById("btnLoadMore");

let pageSize = 9;
let page = 1;

let currentFilters = {
  status: "ALL",
  location: "",
  q: "",
  category: null,
};

function applyFilters(items) {
  return items.filter((it) => {
    const okStatus = currentFilters.status === "ALL" ? true : it.status === currentFilters.status;
    const okLoc = currentFilters.location
      ? it.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      : true;
    const okQ = currentFilters.q
      ? (it.title.toLowerCase().includes(currentFilters.q.toLowerCase()) ||
         it.location.toLowerCase().includes(currentFilters.q.toLowerCase()) ||
         it.category.toLowerCase().includes(currentFilters.q.toLowerCase()))
      : true;
    const okCat = currentFilters.category ? it.category === currentFilters.category : true;

    return okStatus && okLoc && okQ && okCat;
  });
}

function cardTemplate(item) {
  const badgeClass = item.status === "FOUND" ? "badge badge--found" : "badge";
  const badgeText = item.status === "FOUND" ? "FOUND" : "LOST";

  return `
    <article class="card" data-id="${item.id}">
      <div class="card__img" aria-hidden="true">
        <!-- placeholder icon -->
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

  // show/hide load more
  if (visible.length >= filtered.length) {
    btnLoadMore.style.display = "none";
  } else {
    btnLoadMore.style.display = "inline-flex";
  }
}

// --- 4) Events ---
document.getElementById("btnSearch").addEventListener("click", () => {
  const statusSelect = document.getElementById("statusSelect");
  const locationInput = document.getElementById("locationInput");

  currentFilters.status = statusSelect.value;
  currentFilters.location = locationInput.value.trim();

  page = 1;
  render();
});

document.getElementById("globalSearchBtn").addEventListener("click", () => {
  const q = document.getElementById("globalSearch").value.trim();
  currentFilters.q = q;
  page = 1;
  render();
});

// tekan Enter pada global search
document.getElementById("globalSearch").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    currentFilters.q = e.target.value.trim();
    page = 1;
    render();
  }
});

btnLoadMore.addEventListener("click", () => {
  page += 1;
  render();
});

// kategori di sidebar
document.querySelectorAll(".cat").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.getAttribute("data-cat");
    currentFilters.category = (currentFilters.category === cat) ? null : cat;
    page = 1;
    render();
  });
});

// Report (placeholder)
document.getElementById("btnReport").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Halaman Buat Laporan belum dibuat (next step).");
});

// Logout
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
});

// klik card -> detail (placeholder)
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.getAttribute("data-id");
  alert(`Buka detail item ID: ${id} (halaman detail next step)`);
});

// initial render
render();
