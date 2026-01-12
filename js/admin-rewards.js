import { requireAuth, logout, readJSON, writeJSON } from "./utils.js";

/* ===============================
   1) AUTH & GUARD
================================ */
const auth = requireAuth();
if (!auth || auth.role !== "admin") {
  alert("Akses ditolak");
  window.location.href = "./dashboard.html";
  throw new Error("Unauthorized");
}

document.getElementById("userPillText").textContent = `${auth.username} (admin)`;
document.getElementById("btnLogout")?.addEventListener("click", logout);

/* ===============================
   2) DOM REFERENCES
================================ */
const form = document.getElementById("form");
const rid = document.getElementById("rid");

const nameEl = document.getElementById("name");
const categoryEl = document.getElementById("category");
const costEl = document.getElementById("price");
const stockEl = document.getElementById("stock");
const descEl = document.getElementById("desc");

const imgEl = document.getElementById("image");
const imgTag = document.getElementById("imgTag");
const toast = document.getElementById("toast");

const qEl = document.getElementById("q");
const listEl = document.getElementById("list");

let imageBase64 = null;

/* ===============================
   3) STORAGE (SINGLE SOURCE)
================================ */
function getRewards() {
  return readJSON("foundify_rewards", []);
}

function saveRewards(list) {
  writeJSON("foundify_rewards", list);
}

/* ===============================
   4) UTILITIES
================================ */
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 1500);
}

function resetForm() {
  rid.value = "";
  nameEl.value = "";
  categoryEl.value = "";
  costEl.value = "";
  stockEl.value = "";
  descEl.value = "";
  imgEl.value = "";
  imageBase64 = null;
  imgTag.style.display = "none";
}

/* ===============================
   5) IMAGE UPLOAD
================================ */
imgEl.addEventListener("change", () => {
  const file = imgEl.files?.[0];
  if (!file) return;

  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.type)) {
    alert("File harus JPG / PNG");
    imgEl.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Ukuran maksimal 2MB");
    imgEl.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result;
    imgTag.src = imageBase64;
    imgTag.style.display = "block";
  };
  reader.readAsDataURL(file);
});

/* ===============================
   6) RENDER LIST
================================ */
function render() {
  let rewards = getRewards();
  const q = qEl.value.trim().toLowerCase();

  if (q) {
    rewards = rewards.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }

  if (rewards.length === 0) {
    listEl.innerHTML = `<div class="small">Belum ada reward.</div>`;
    return;
  }

  listEl.innerHTML = rewards
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(r => `
      <div class="item" data-id="${r.id}">
        <div class="top">
          <div><b>${r.name}</b></div>
          <div class="small">${r.cost} poin • stok ${r.stock}</div>
        </div>
        <div class="small">${r.category}</div>
        <div class="small" style="margin-top:6px;">${r.desc}</div>
        <div class="actions">
          <button class="btn btn--ghost" data-act="edit">Edit</button>
          <button class="btn btn--ghost" data-act="del">Hapus</button>
        </div>
      </div>
    `)
    .join("");
}

/* ===============================
   7) SUBMIT FORM
================================ */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = rid.value ? Number(rid.value) : null;
  const name = nameEl.value.trim();
  const category = categoryEl.value;
  const cost = Number(costEl.value);
  const stock = Number(stockEl.value);
  const desc = descEl.value.trim();

  if (!name || !category || desc.length < 5 || cost <= 0 || stock < 0) {
    alert("Data reward tidak valid");
    return;
  }

  const rewards = getRewards();

  if (!id) {
    rewards.unshift({
      id: Date.now(),
      name,
      category,
      cost,
      stock,
      desc,
      image: imageBase64,
      created_at: new Date().toISOString()
    });
    showToast("Reward ditambahkan ✅");
  } else {
    const idx = rewards.findIndex(r => r.id === id);
    if (idx === -1) return;

    rewards[idx] = {
      ...rewards[idx],
      name,
      category,
      cost,
      stock,
      desc,
      image: imageBase64 ?? rewards[idx].image
    };
    showToast("Reward diupdate ✅");
  }

  saveRewards(rewards);
  resetForm();
  render();
});

/* ===============================
   8) EDIT / DELETE
================================ */
listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const item = btn.closest(".item");
  const id = Number(item.dataset.id);
  const rewards = getRewards();
  const idx = rewards.findIndex(r => r.id === id);
  if (idx === -1) return;

  if (btn.dataset.act === "edit") {
    const r = rewards[idx];
    rid.value = r.id;
    nameEl.value = r.name;
    categoryEl.value = r.category;
    costEl.value = r.cost;
    stockEl.value = r.stock;
    descEl.value = r.desc;

    imageBase64 = r.image || null;
    if (imageBase64) {
      imgTag.src = imageBase64;
      imgTag.style.display = "block";
    }
  }

  if (btn.dataset.act === "del") {
    if (!confirm("Hapus reward ini?")) return;
    rewards.splice(idx, 1);
    saveRewards(rewards);
    render();
    showToast("Reward dihapus ✅");
  }
});

/* ===============================
   9) EVENTS
================================ */
qEl.addEventListener("input", render);
document.getElementById("btnReset")?.addEventListener("click", resetForm);

/* ===============================
   INIT
================================ */
render();
