// ===== Detail Page - Foundify =====

function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Auth ---
function getAuth() {
  return readJSON("foundify_auth", null);
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
document.getElementById("userPillText").textContent = `${auth.username} (${auth.role})`;

// show admin link
if (auth.role === "admin") {
  document.getElementById("adminClaimsLink").style.display = "flex";
}

// --- logout ---
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
});

// --- get id from url ---
const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");
if (!itemId) {
  window.location.href = "./dashboard.html";
}

// --- data sources ---
function getReports() { return readJSON("foundify_reports", []); }
function getClaims() { return readJSON("foundify_claims", []); }
function getPoints() { return readJSON("foundify_points", []); }

// --- build items like dashboard (reports + dummy) ---
const categories = ["Aksesoris", "Dokumen", "Elektronik", "Pakaian", "Lainnya"];
const places = ["Parkiran Motor, Area 1","Perpustakaan, Area 2","Taman, Area 2","Kantin, Area 3","Masjid, Area 1","Lobby, Area 2"];
const ITEM_MASTER = {
  Aksesoris:{ LOST:[{title:"Kehilangan Jam Tangan",desc:"Jam tangan warna hitam, tali karet, kemungkinan terjatuh."}],
              FOUND:[{title:"Ditemukan Gelang",desc:"Gelang stainless ditemukan di area sekitar."}]},
  Dokumen:{ LOST:[{title:"Kehilangan KTP",desc:"KTP kemungkinan tercecer, mohon dikembalikan jika ditemukan."}],
            FOUND:[{title:"Ditemukan Kartu Mahasiswa",desc:"Kartu mahasiswa ditemukan di area kampus."}]},
  Elektronik:{ LOST:[{title:"Kehilangan HP",desc:"HP Android warna hitam, casing transparan."}],
               FOUND:[{title:"Ditemukan Power Bank",desc:"Power bank 10.000mAh warna hitam."}]},
  Pakaian:{ LOST:[{title:"Kehilangan Jaket",desc:"Jaket hoodie warna abu-abu."}],
            FOUND:[{title:"Ditemukan Jaket",desc:"Jaket parasut warna biru."}]},
  Lainnya:{ LOST:[{title:"Kehilangan Botol Minum",desc:"Botol minum stainless warna biru."}],
            FOUND:[{title:"Ditemukan Helm",desc:"Helm standar SNI ditemukan di parkiran."}]}
};

function formatDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
}
function makeDummy(count = 36) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const cat = categories[i % categories.length];
    const status = i % 2 === 0 ? "LOST" : "FOUND";
    const pick = ITEM_MASTER[cat][status][0];
    const dt = new Date(); dt.setDate(dt.getDate() - (i % 15));
    items.push({
      id: `dummy-${i}`,
      status,
      title: `${pick.title} #${i}`,
      description: pick.desc,
      category: cat,
      location: places[i % places.length],
      date: formatDate(dt),
      author: "system",
      coins: (i % 5 + 1) * 10,
      image: null,
      source: "dummy"
    });
  }
  return items;
}
function buildAllItems() {
  const dummy = makeDummy(36);
  const reports = getReports().map(r => ({
    id: String(r.id),
    status: r.status,
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    date: new Date(r.date).toLocaleDateString("en-US",{month:"short",day:"2-digit"}).replace(",",""),
    author: r.author,
    coins: r.coins ?? 10,
    image: r.image || null,
    source: "report"
  }));
  return [...reports, ...dummy];
}

const ALL_ITEMS = buildAllItems();
const item = ALL_ITEMS.find(x => String(x.id) === String(itemId));
if (!item) window.location.href = "./dashboard.html";

// --- render detail ---
const badge = document.getElementById("badge");
badge.textContent = item.status;
badge.className = item.status === "FOUND" ? "badge badge--found" : "badge";

document.getElementById("date").textContent = item.date;
document.getElementById("title").textContent = item.title;
document.getElementById("category").textContent = `Kategori: ${item.category}`;
document.getElementById("desc").textContent = item.description || "-";
document.getElementById("loc").textContent = item.location;
document.getElementById("author").textContent = item.author;
document.getElementById("coins").textContent = `${item.coins} Coins`;

const media = document.getElementById("detailMedia");
media.innerHTML = item.image
  ? `<img src="${item.image}" alt="gambar item">`
  : `<div class="muted">Tidak ada gambar</div>`;

// --- Claim submit (USER) ---
const claimForm = document.getElementById("claimForm");
const claimText = document.getElementById("claimText");
const claimFile = document.getElementById("claimFile");
const proofImg = document.getElementById("proofImg");
const errText = document.getElementById("errText");
const errFile = document.getElementById("errFile");
const toast = document.getElementById("toast");

let proofBase64 = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 1800);
}

claimFile.addEventListener("change", () => {
  errFile.textContent = "";
  const file = claimFile.files?.[0];
  if (!file) { proofBase64 = null; proofImg.style.display="none"; return; }

  const allowed = ["image/jpeg","image/png","image/jpg"];
  if (!allowed.includes(file.type)) {
    errFile.textContent = "Tipe file harus JPG/PNG.";
    claimFile.value = "";
    return;
  }
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    errFile.textContent = "Ukuran gambar maksimal 2MB.";
    claimFile.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    proofBase64 = reader.result;
    proofImg.src = proofBase64;
    proofImg.style.display = "block";
  };
  reader.readAsDataURL(file);
});

claimForm.addEventListener("submit", (e) => {
  e.preventDefault();
  errText.textContent = "";
  errFile.textContent = "";

  const text = claimText.value.trim();
  if (text.length < 10) {
    errText.textContent = "Bukti klaim minimal 10 karakter.";
    return;
  }

  const claims = getClaims();
  claims.unshift({
    id: Date.now(),
    item_id: String(item.id),
    item_title: item.title,
    item_status: item.status,
    item_author: item.author, // yang melaporkan (finder jika FOUND)
    claimant: auth.username,
    claimant_role: auth.role,
    proof_text: text,
    proof_image: proofBase64,
    status: "PENDING", // PENDING/APPROVED/REJECTED
    created_at: new Date().toISOString(),
    verified_by: null,
    verified_at: null
  });

  writeJSON("foundify_claims", claims);
  claimForm.reset();
  proofBase64 = null;
  proofImg.style.display = "none";

  showToast("Klaim terkirim ✅ (menunggu verifikasi admin)");
  if (auth.role === "admin") renderAdminClaims();
});

// --- Admin verifikasi klaim untuk item ini ---
const adminPanel = document.getElementById("adminPanel");
const adminClaimsList = document.getElementById("adminClaimsList");

function claimCard(c) {
  const img = c.proof_image ? `<img src="${c.proof_image}" alt="bukti" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;margin-top:8px;">` : "";
  const status = c.status;

  return `
    <div class="claim-card" data-claim="${c.id}">
      <div class="row">
        <div><b>${c.claimant}</b> <span class="small">(${status})</span></div>
        <div class="small">${new Date(c.created_at).toLocaleString()}</div>
      </div>
      <div class="small" style="margin-top:6px;">Bukti: ${c.proof_text}</div>
      ${img}
      ${
        auth.role === "admin" && status === "PENDING"
          ? `
            <div class="actions">
              <button class="btn btn--ghost" data-act="reject">Reject</button>
              <button class="btn btn--primary" data-act="approve">Approve</button>
            </div>
          `
          : status !== "PENDING"
            ? `<div class="small" style="margin-top:10px;">Diverifikasi oleh: <b>${c.verified_by || "-"}</b></div>`
            : ""
      }
    </div>
  `;
}

function renderAdminClaims() {
  if (auth.role !== "admin") return;

  adminPanel.style.display = "block";
  const claims = getClaims().filter(c => String(c.item_id) === String(item.id));
  if (claims.length === 0) {
    adminClaimsList.innerHTML = `<div class="muted">Belum ada klaim untuk item ini.</div>`;
    return;
  }
  adminClaimsList.innerHTML = claims.map(claimCard).join("");
}

function addPoints(username, delta, note) {
  const points = getPoints();
  points.unshift({
    id: Date.now(),
    username,
    delta,
    note,
    created_at: new Date().toISOString()
  });
  writeJSON("foundify_points", points);
}

adminClaimsList.addEventListener("click", (e) => {
  if (auth.role !== "admin") return;
  const btn = e.target.closest("button");
  if (!btn) return;
  const card = e.target.closest(".claim-card");
  if (!card) return;

  const act = btn.getAttribute("data-act");
  const claimId = Number(card.getAttribute("data-claim"));

  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === claimId);
  if (idx === -1) return;

  const c = claims[idx];
  if (c.status !== "PENDING") return;

  if (act === "approve") {
    c.status = "APPROVED";
    c.verified_by = auth.username;
    c.verified_at = new Date().toISOString();

    // reward coins -> ke pelapor item (finder) jika status FOUND
    // jika LOST, reward bisa ke orang yang menemukan (tidak ada di versi ini), jadi kita set ke author juga
    const reward = Number(item.coins || 10);
    addPoints(item.author, reward, `Reward dari klaim item: ${item.title}`);

    claims[idx] = c;
    writeJSON("foundify_claims", claims);
    renderAdminClaims();
  }

  if (act === "reject") {
    c.status = "REJECTED";
    c.verified_by = auth.username;
    c.verified_at = new Date().toISOString();
    claims[idx] = c;
    writeJSON("foundify_claims", claims);
    renderAdminClaims();
  }
});

// init admin view
if (auth.role === "admin") renderAdminClaims();
