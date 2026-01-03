// ===== Report Page - Foundify =====

// --- Auth guard ---
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
  const pill = document.getElementById("userPillText");
  if (pill) pill.textContent = `${auth.username} (${auth.role})`;
}

// --- DOM refs ---
const form = document.getElementById("reportForm");
const statusEl = document.getElementById("status");
const categoryEl = document.getElementById("category");
const itemNameEl = document.getElementById("itemName");
const descEl = document.getElementById("description");
const locationEl = document.getElementById("location");
const dateEl = document.getElementById("date");
const coinsEl = document.getElementById("coins");
const contactEl = document.getElementById("contact");

const imageEl = document.getElementById("image");
const imgPreview = document.getElementById("imgPreview");
const imgTag = document.getElementById("imgTag");
const toast = document.getElementById("toast");

// default date = today
dateEl.valueAsDate = new Date();

function setErr(key, msg) {
  const el = document.querySelector(`[data-err="${key}"]`);
  if (el) el.textContent = msg || "";
}
function clearErrs() {
  ["status","category","itemName","description","location","date","coins","image"].forEach(k => setErr(k,""));
}

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 1800);
}

// --- image preview + validation ---
let imageBase64 = null;

imageEl.addEventListener("change", () => {
  setErr("image", "");
  const file = imageEl.files?.[0];
  if (!file) {
    imageBase64 = null;
    imgTag.style.display = "none";
    imgPreview.querySelector(".preview__empty").style.display = "grid";
    return;
  }

  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.type)) {
    setErr("image", "Tipe file harus JPG/PNG.");
    imageEl.value = "";
    return;
  }

  const maxBytes = 2 * 1024 * 1024; // 2MB
  if (file.size > maxBytes) {
    setErr("image", "Ukuran gambar maksimal 2MB.");
    imageEl.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result;
    imgTag.src = imageBase64;
    imgTag.style.display = "block";
    imgPreview.querySelector(".preview__empty").style.display = "none";
  };
  reader.readAsDataURL(file);
});

// --- storage helper ---
function getReports() {
  const raw = localStorage.getItem("foundify_reports");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function saveReports(list) {
  localStorage.setItem("foundify_reports", JSON.stringify(list));
}

// --- submit ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrs();

  const status = statusEl.value.trim();
  const category = categoryEl.value.trim();
  const itemName = itemNameEl.value.trim();
  const description = descEl.value.trim();
  const location = locationEl.value.trim();
  const date = dateEl.value;
  const coinsRaw = coinsEl.value.trim();
  const contact = contactEl.value.trim();

  let ok = true;

  if (!status) { setErr("status", "Status wajib dipilih."); ok = false; }
  if (!category) { setErr("category", "Kategori wajib dipilih."); ok = false; }
  if (!itemName || itemName.length < 3) { setErr("itemName", "Nama barang minimal 3 karakter."); ok = false; }
  if (!description || description.length < 10) { setErr("description", "Deskripsi minimal 10 karakter."); ok = false; }
  if (!location || location.length < 3) { setErr("location", "Lokasi minimal 3 karakter."); ok = false; }
  if (!date) { setErr("date", "Tanggal wajib diisi."); ok = false; }

  let coins = 10;
  if (coinsRaw) {
    const n = Number(coinsRaw);
    if (Number.isNaN(n) || n < 0) {
      setErr("coins", "Coins harus angka >= 0.");
      ok = false;
    } else {
      coins = n;
    }
  }

  if (!ok) return;

  const report = {
    id: Date.now(),
    status,            // LOST / FOUND
    category,
    title: `${status === "LOST" ? "Kehilangan" : "Ditemukan"} ${itemName}`,
    itemName,
    description,
    location,
    date,
    coins,
    contact,
    image: imageBase64, // base64 string (opsional)
    author: auth.username,
    role: auth.role,
    created_at: new Date().toISOString(),
  };

  const reports = getReports();
  reports.unshift(report);
  saveReports(reports);

  showToast("Laporan berhasil dibuat ✅");

  setTimeout(() => {
    window.location.href = "../pages/dashboard.html";
  }, 800);
});

// --- logout ---
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
});
