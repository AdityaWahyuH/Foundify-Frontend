import {
  requireAuth,
  logout,
  readJSON,
  writeJSON,
  getTotalPoints,
  addPointHistory,
  nowISO
} from "./utils.js";

/* ===============================
   1) AUTH + HEADER
================================ */
const auth = requireAuth();
if (!auth) throw new Error("Unauthorized");

document.getElementById("btnLogout")?.addEventListener("click", logout);

const userPillText = document.getElementById("userPillText");
if (userPillText) {
  userPillText.textContent = `${auth.username} (${auth.role})`;
}

if (auth.role === "admin") {
  document.getElementById("adminClaimsLink")?.style.setProperty("display", "flex");
  document.getElementById("adminRewardsLink")?.style.setProperty("display", "flex");
  document.getElementById("adminRedeemLink")?.style.setProperty("display", "flex");
}

/* ===============================
   2) DOM
================================ */
const grid = document.getElementById("rewardsGrid");
const meta = document.getElementById("rewardMeta");
const myPointsEl = document.getElementById("myPoints");

const searchInput = document.getElementById("rewardSearch");
const searchBtn = document.getElementById("rewardSearchBtn");
const catSelect = document.getElementById("rewardCategory");
const sortSelect = document.getElementById("rewardSort");

/* ===============================
   3) STATE
================================ */
let q = "";
let cat = "ALL";
let sort = "POPULAR";

/* ===============================
   4) STORAGE
================================ */
function getRewards() {
  return readJSON("foundify_rewards", []);
}
function saveRewards(list) {
  writeJSON("foundify_rewards", list);
}

/* ===============================
   5) HELPERS
================================ */
function refreshPoints() {
  if (myPointsEl) {
    myPointsEl.textContent = getTotalPoints(auth.username);
  }
}

function matchReward(r) {
  const qq = q.toLowerCase().trim();

  const okQ = qq
    ? r.name.toLowerCase().includes(qq) ||
      r.desc.toLowerCase().includes(qq) ||
      r.category.toLowerCase().includes(qq)
    : true;

  const okCat = cat === "ALL" ? true : r.category === cat;
  return okQ && okCat;
}

function sortRewards(list) {
  const arr = [...list];
  if (sort === "CHEAPEST") arr.sort((a, b) => a.cost - b.cost);
  else if (sort === "EXPENSIVE") arr.sort((a, b) => b.cost - a.cost);
  else if (sort === "NAME") arr.sort((a, b) => a.name.localeCompare(b.name));
  else {
    // POPULAR (dummy)
    arr.sort((a, b) => (b.stock * 2 - b.cost) - (a.stock * 2 - a.cost));
  }
  return arr;
}

/* ===============================
   6) CARD TEMPLATE (FIX)
================================ */
function cardTemplate(r) {
  const myPts = getTotalPoints(auth.username);
  const canRedeem = myPts >= r.cost && r.stock > 0;

  const img = r.image
    ? `<img src="${r.image}" alt="${r.name}" />`
    : `<span class="emoji">🎁</span>`;

  return `
    <article class="reward" data-id="${r.id}">
      <div class="reward__img">${img}</div>

      <div class="reward__body">
        <div class="reward__top">
          <span class="tag">${r.category}</span>
          <span class="points">${r.cost} Poin</span>
        </div>

        <h3 class="reward__title">${r.name}</h3>
        <p class="reward__desc">${r.desc}</p>

        <div class="reward__foot">
          <span>Stok: <b>${r.stock}</b></span>
          <button class="btnRedeem" ${canRedeem ? "" : "disabled"}>
            ${r.stock <= 0 ? "Habis" : canRedeem ? "Tukar" : "Poin Kurang"}
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ===============================
   7) RENDER
================================ */
function render() {
  const rewards = getRewards();
  const filtered = rewards.filter(matchReward);
  const sorted = sortRewards(filtered);

  if (meta) meta.textContent = `Menampilkan ${sorted.length} reward`;

  if (!grid) return;
  grid.innerHTML = sorted.map(cardTemplate).join("");
}

/* ===============================
   8) REDEEM FLOW
================================ */
function redeem(id) {
  const rewards = getRewards();
  const idx = rewards.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return;

  const r = rewards[idx];
  const myPts = getTotalPoints(auth.username);

  if (myPts < r.cost) return alert("Poin kamu belum cukup.");
  if (r.stock <= 0) return alert("Stok reward habis.");

  const ok = confirm(`Tukar "${r.name}" dengan ${r.cost} poin?`);
  if (!ok) return;

  // Kurangi poin
  addPointHistory(auth.username, -r.cost, `Tukar reward: ${r.name}`);

  // Kurangi stok
  rewards[idx].stock -= 1;
  saveRewards(rewards);

  // Simpan riwayat penukaran
  const history = readJSON("foundify_redemptions", []);
  history.push({
    id: `REDEEM-${Date.now()}`,
    username: auth.username,
    reward_id: r.id,
    reward_name: r.name,
    cost: r.cost,
    status: "PENDING",
    created_at: nowISO()
  });
  writeJSON("foundify_redemptions", history);

  alert("Reward berhasil ditukar. Menunggu verifikasi admin.");
  refreshPoints();
  render();
}

/* ===============================
   9) EVENTS
================================ */
searchBtn?.addEventListener("click", () => {
  q = searchInput.value || "";
  render();
});

searchInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    q = searchInput.value || "";
    render();
  }
});

catSelect?.addEventListener("change", () => {
  cat = catSelect.value || "ALL";
  render();
});

sortSelect?.addEventListener("change", () => {
  sort = sortSelect.value || "POPULAR";
  render();
});

grid?.addEventListener("click", e => {
  const btn = e.target.closest(".btnRedeem");
  if (!btn) return;
  const card = e.target.closest(".reward");
  if (!card) return;
  redeem(card.dataset.id);
});

/* ===============================
   INIT
================================ */
refreshPoints();
render();
