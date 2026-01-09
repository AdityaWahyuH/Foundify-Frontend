import {
  requireAuth, logout, readJSON, writeJSON,
  getTotalPoints, addPoints, pushNotification
} from "./utils.js";

const auth = requireAuth();
if (auth.role !== "admin") window.location.href = "./dashboard.html";

document.getElementById("userPillText").textContent = `${auth.username} (admin)`;
document.getElementById("btnLogout").addEventListener("click", logout);

const listEl = document.getElementById("list");
const filterEl = document.getElementById("filterStatus");
const qEl = document.getElementById("q");

function getRewards(){ return readJSON("foundify_rewards", []); }
function getRedemptions(){ return readJSON("foundify_redemptions", []); }
function saveRedemptions(arr){ writeJSON("foundify_redemptions", arr); }
function saveRewards(arr){ writeJSON("foundify_rewards", arr); }

function badge(status){
  if (status === "APPROVED") return `<span class="badge2 ok">APPROVED</span>`;
  if (status === "REJECTED") return `<span class="badge2 no">REJECTED</span>`;
  return `<span class="badge2 wait">PENDING</span>`;
}

function render(){
  let rows = getRedemptions();

  const fs = filterEl.value;
  if (fs !== "ALL") rows = rows.filter(r => r.status === fs);

  const qq = qEl.value.trim().toLowerCase();
  if (qq) {
    rows = rows.filter(r =>
      (r.username||"").toLowerCase().includes(qq) ||
      (r.reward_name||"").toLowerCase().includes(qq)
    );
  }

  if (rows.length === 0) {
    listEl.innerHTML = `<div style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;font-weight:1000;color:rgba(15,23,42,.6);">Tidak ada data penukaran.</div>`;
    return;
  }

  listEl.innerHTML = rows.map(r => `
    <div class="card" data-id="${r.id}">
      <div class="top">
        <div>${r.username} • ${r.reward_name}</div>
        ${badge(r.status)}
      </div>
      <div class="small" style="margin-top:6px;">Biaya: <b>${r.price}</b> poin</div>
      <div class="small">Tanggal: ${new Date(r.created_at).toLocaleString()}</div>
      ${r.status !== "PENDING" ? `<div class="small">Diverifikasi oleh: <b>${r.verified_by}</b></div>` : ""}

      ${
        r.status === "PENDING"
          ? `<div class="actions">
              <button class="btn btn--ghost" data-act="reject">Reject</button>
              <button class="btn btn--primary" data-act="approve">Approve</button>
            </div>`
          : ""
      }
    </div>
  `).join("");
}

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const card = e.target.closest(".card");
  if (!card) return;

  const id = Number(card.getAttribute("data-id"));
  const act = btn.getAttribute("data-act");

  const redemptions = getRedemptions();
  const idx = redemptions.findIndex(r => r.id === id);
  if (idx === -1) return;

  const r = redemptions[idx];
  if (r.status !== "PENDING") return;

  const rewards = getRewards();
  const ridx = rewards.findIndex(x => String(x.id) === String(r.reward_id));
  const reward = ridx !== -1 ? rewards[ridx] : null;

  if (act === "approve") {
    // Cek stok reward
    if (!reward || reward.stock <= 0) {
      alert("Stok reward habis / reward tidak ditemukan.");
      return;
    }

    // Potong poin user (baru dipotong saat disetujui admin)
    const current = getTotalPoints(r.username);
    if (current < r.price) {
      alert("Poin user tidak cukup (gagal approve).");
      return;
    }

    // Update stok
    reward.stock -= 1;
    rewards[ridx] = reward;
    saveRewards(rewards);

    // Catat potongan poin
    addPoints(r.username, -Number(r.price), `Penukaran reward: ${r.reward_name}`);

    // Update status
    r.status = "APPROVED";
    r.verified_by = auth.username;
    r.verified_at = new Date().toISOString();
    redemptions[idx] = r;
    saveRedemptions(redemptions);

    // notif user
    pushNotification({
      to: r.username,
      title: "Penukaran Disetujui",
      message: `Penukaran reward "${r.reward_name}" disetujui admin. Poin terpotong ${r.price}.`,
      meta: { type:"redeem", status:"APPROVED" }
    });

    render();
  }

  if (act === "reject") {
    r.status = "REJECTED";
    r.verified_by = auth.username;
    r.verified_at = new Date().toISOString();
    redemptions[idx] = r;
    saveRedemptions(redemptions);

    pushNotification({
      to: r.username,
      title: "Penukaran Ditolak",
      message: `Penukaran reward "${r.reward_name}" ditolak admin.`,
      meta: { type:"redeem", status:"REJECTED" }
    });

    render();
  }
});

document.getElementById("btnRefresh").addEventListener("click", render);
filterEl.addEventListener("change", render);
qEl.addEventListener("input", render);

document.getElementById("btnLogout").addEventListener("click", logout);

render();
