import { requireAuth, logout, readJSON, writeJSON } from "./utils.js";

const auth = requireAuth();
if (auth.role !== "admin") window.location.href = "./dashboard.html";

document.getElementById("userPillText").textContent = `${auth.username} (admin)`;
document.getElementById("btnLogout").addEventListener("click", logout);

const form = document.getElementById("form");
const rid = document.getElementById("rid");
const nameEl = document.getElementById("name");
const priceEl = document.getElementById("price");
const stockEl = document.getElementById("stock");
const descEl = document.getElementById("desc");
const imgEl = document.getElementById("image");
const imgTag = document.getElementById("imgTag");
const toast = document.getElementById("toast");

const qEl = document.getElementById("q");
const listEl = document.getElementById("list");

let imageBase64 = null;

function showToast(msg){
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(()=> toast.style.display="none", 1500);
}

function getRewards(){ return readJSON("foundify_rewards", []); }
function saveRewards(arr){ writeJSON("foundify_rewards", arr); }

imgEl.addEventListener("change", () => {
  const file = imgEl.files?.[0];
  if (!file) { imageBase64 = null; imgTag.style.display="none"; return; }

  const allowed = ["image/jpeg","image/png","image/jpg"];
  if (!allowed.includes(file.type)) { alert("File harus JPG/PNG"); imgEl.value=""; return; }
  if (file.size > 2*1024*1024) { alert("Maks 2MB"); imgEl.value=""; return; }

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result;
    imgTag.src = imageBase64;
    imgTag.style.display = "block";
  };
  reader.readAsDataURL(file);
});

function resetForm(){
  rid.value = "";
  nameEl.value = "";
  priceEl.value = "";
  stockEl.value = "";
  descEl.value = "";
  imgEl.value = "";
  imageBase64 = null;
  imgTag.style.display = "none";
}

document.getElementById("btnReset").addEventListener("click", resetForm);

function render(){
  let rewards = getRewards();

  const qq = qEl.value.trim().toLowerCase();
  if (qq) rewards = rewards.filter(r =>
    (r.name||"").toLowerCase().includes(qq) ||
    (r.desc||"").toLowerCase().includes(qq)
  );

  if (rewards.length === 0) {
    listEl.innerHTML = `<div class="small">Belum ada reward.</div>`;
    return;
  }

  listEl.innerHTML = rewards
    .sort((a,b)=> new Date(b.created_at)-new Date(a.created_at))
    .map(r => `
      <div class="item" data-id="${r.id}">
        <div class="top">
          <div>${r.name}</div>
          <div class="small">${r.price} poin • stok ${r.stock}</div>
        </div>
        <div class="small" style="margin-top:6px;">${r.desc}</div>
        <div class="actions">
          <button class="btn btn--ghost" data-act="edit">Edit</button>
          <button class="btn btn--ghost" data-act="del">Hapus</button>
        </div>
      </div>
    `).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = rid.value ? Number(rid.value) : null;

  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const stock = Number(stockEl.value);
  const desc = descEl.value.trim();

  if (!name || desc.length < 5 || Number.isNaN(price) || Number.isNaN(stock)) return;

  const rewards = getRewards();

  if (!id) {
    rewards.unshift({
      id: Date.now(),
      name,
      price,
      stock,
      desc,
      image: imageBase64,
      created_at: new Date().toISOString()
    });
    saveRewards(rewards);
    showToast("Reward ditambahkan ✅");
  } else {
    const idx = rewards.findIndex(r => r.id === id);
    if (idx === -1) return;

    const old = rewards[idx];
    rewards[idx] = {
      ...old,
      name,
      price,
      stock,
      desc,
      image: imageBase64 ?? old.image
    };
    saveRewards(rewards);
    showToast("Reward diupdate ✅");
  }

  resetForm();
  render();
});

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const wrap = e.target.closest(".item");
  if (!wrap) return;

  const id = Number(wrap.getAttribute("data-id"));
  const act = btn.getAttribute("data-act");
  const rewards = getRewards();
  const idx = rewards.findIndex(r => r.id === id);
  if (idx === -1) return;

  if (act === "edit") {
    const r = rewards[idx];
    rid.value = r.id;
    nameEl.value = r.name;
    priceEl.value = r.price;
    stockEl.value = r.stock;
    descEl.value = r.desc;
    imageBase64 = r.image || null;
    if (imageBase64) {
      imgTag.src = imageBase64;
      imgTag.style.display = "block";
    } else {
      imgTag.style.display = "none";
    }
  }

  if (act === "del") {
    if (!confirm("Hapus reward ini?")) return;
    rewards.splice(idx, 1);
    saveRewards(rewards);
    render();
    showToast("Reward dihapus ✅");
  }
});

qEl.addEventListener("input", render);
render();
