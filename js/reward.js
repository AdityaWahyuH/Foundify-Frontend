import {
  requireAuth, logout, readJSON, writeJSON,
  getTotalPoints, addPoints, pushNotification
} from "./utils.js";

const auth = requireAuth();
document.getElementById("userPillText").textContent = `${auth.username} (${auth.role})`;
document.getElementById("btnLogout").addEventListener("click", logout);

if (auth.role === "admin") {
  const a1 = document.getElementById("adminClaimsLink");
  const a2 = document.getElementById("adminRewardsLink");
  const a3 = document.getElementById("adminRedeemLink");
  if (a1) a1.style.display = "flex";
  if (a2) a2.style.display = "flex";
  if (a3) a3.style.display = "flex";
}

const grid = document.getElementById("grid");
const myPointsEl = document.getElementById("myPoints");
const qEl = document.getElementById("q");
const sortEl = document.getElementById("sort");
const toast = document.getElementById("toast");

function seedRewardsIfEmpty() {
  const rewards = readJSON("foundify_rewards", []);
  if (rewards.length > 0) return;

  const seed = [
    { id: Date.now()+1, name:"Voucher Kantin 10k", desc:"Voucher makan di kantin kampus senilai Rp10.000.", price:50, stock:20, image:null, created_at:new Date().toISOString() },
    { id: Date.now()+2, name:"Pulpen Premium", desc:"Pulpen premium untuk kebutuhan catatan sehari-hari.", price:40, stock:15, image:null, created_at:new Date().toISOString() },
    { id: Date.now()+3, name:"Tumbler Foundify", desc:"Tumbler eksklusif Foundify (limited edition).", price:120, stock:8, image:null, created_at:new Date().toISOString() },
    { id: Date.now()+4, name:"Voucher Parkir 1 Minggu", desc:"Gratis parkir selama 1 minggu (sesuai ketentuan).", price:150, stock:5, image:null, created_at:new Date().toISOString() },
    { id: Date.now()+5, name:"Merch Kaos", desc:"Kaos Foundify, ukuran bisa pilih saat penukaran disetujui.", price:200, stock:6, image:null, created_at:new Date().toISOString() },
  ];
  writeJSON("foundify_rewards", seed);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(()=> toast.style.display = "none", 1600);
}

function getRewards() {
  return readJSON("foundify_rewards", []);
}

function getRedemptions() {
  return readJSON("foundify_redemptions", []);
}

function setMyPoints() {
  myPointsEl.textContent = getTotalPoints(auth.username);
}

function rewardCard(r) {
  const points = getTotalPoints(auth.username);
  const can = points >= r.price && r.stock > 0;

  return `
    <article class="reward" data-id="${r.id}">
      <div class="thumb">
        ${
          r.image
            ? `<img src="${r.image}" alt="reward">`
            : `<div style="font-weight:1000;color:rgba(15,23,42,.55);">Reward</div>`
        }
      </div>
      <div class="body">
        <h3 class="name">${r.name}</h3>
        <p class="desc">${r.desc}</p>

        <div class="row">
          <div class="price">${r.price} poin</div>
          <div class="small">Stok: ${r.stock}</div>
        </div>

        <div class="row">
          <button class="btn btn--primary" data-act="redeem" ${can ? "" : "disabled"}>
            Tukar
          </button>
        </div>
      </div>
    </article>
  `;
}

function render() {
  setMyPoints();
  let rewards = getRewards();

  const qq = qEl.value.trim().toLowerCase();
  if (qq) {
    rewards = rewards.filter(r =>
      (r.name || "").toLowerCase().includes(qq) ||
      (r.desc || "").toLowerCase().includes(qq)
    );
  }

  const sort = sortEl.value;
  if (sort === "NEW") rewards.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  if (sort === "CHEAP") rewards.sort((a,b)=> a.price - b.price);
  if (sort === "EXP") rewards.sort((a,b)=> b.price - a.price);

  if (rewards.length === 0) {
    grid.innerHTML = `<div style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;font-weight:1000;color:rgba(15,23,42,.6);">Reward tidak ditemukan.</div>`;
    return;
  }

  grid.innerHTML = rewards.map(rewardCard).join("");
}

function redeem(rewardId) {
  const rewards = getRewards();
  const idx = rewards.findIndex(r => String(r.id) === String(rewardId));
  if (idx === -1) return;

  const r = rewards[idx];
  const points = getTotalPoints(auth.username);

  if (r.stock <= 0) return showToast("Stok habis.");
  if (points < r.price) return showToast("Poin tidak cukup.");

  // Buat request penukaran -> butuh verifikasi admin (sesuai use case)
  const redemptions = getRedemptions();
  redemptions.unshift({
    id: Date.now(),
    username: auth.username,
    reward_id: r.id,
    reward_name: r.name,
    price: r.price,
    status: "PENDING",          // PENDING/APPROVED/REJECTED
    created_at: new Date().toISOString(),
    verified_by: null,
    verified_at: null,
  });
  writeJSON("foundify_redemptions", redemptions);

  // notif ke admin
  pushNotification({
    to: "superadmin",
    title: "Penukaran Reward Baru",
    message: `${auth.username} mengajukan penukaran: ${r.name} (${r.price} poin).`,
    meta: { type:"redeem", redemption_id: redemptions[0].id }
  });

  showToast("Permintaan tukar dikirim (menunggu verifikasi admin) ✅");
  render();
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const card = e.target.closest(".reward");
  if (!card) return;
  const id = card.getAttribute("data-id");
  const act = btn.getAttribute("data-act");
  if (act === "redeem") redeem(id);
});

qEl.addEventListener("input", render);
sortEl.addEventListener("change", render);

seedRewardsIfEmpty();
render();
