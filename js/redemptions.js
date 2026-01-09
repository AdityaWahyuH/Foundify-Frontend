import { requireAuth, logout, readJSON } from "./utils.js";

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

const listEl = document.getElementById("list");
const filterEl = document.getElementById("filterStatus");
const qEl = document.getElementById("q");

function getRedemptions() {
  return readJSON("foundify_redemptions", []);
}

function badge(status) {
  if (status === "APPROVED") return `<span class="badge2 ok">APPROVED</span>`;
  if (status === "REJECTED") return `<span class="badge2 no">REJECTED</span>`;
  return `<span class="badge2 wait">PENDING</span>`;
}

function render() {
  let rows = getRedemptions().filter(r => r.username === auth.username);

  const fs = filterEl.value;
  if (fs !== "ALL") rows = rows.filter(r => r.status === fs);

  const qq = qEl.value.trim().toLowerCase();
  if (qq) rows = rows.filter(r => (r.reward_name || "").toLowerCase().includes(qq));

  if (rows.length === 0) {
    listEl.innerHTML = `<div style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;font-weight:1000;color:rgba(15,23,42,.6);">Belum ada riwayat penukaran.</div>`;
    return;
  }

  listEl.innerHTML = rows.map(r => `
    <div class="card">
      <div class="top">
        <div>${r.reward_name}</div>
        ${badge(r.status)}
      </div>
      <div class="small" style="margin-top:6px;">Biaya: <b>${r.price}</b> poin</div>
      <div class="small">Tanggal: ${new Date(r.created_at).toLocaleString()}</div>
      ${r.status !== "PENDING" ? `<div class="small">Diverifikasi oleh: <b>${r.verified_by || "-"}</b></div>` : ""}
    </div>
  `).join("");
}

filterEl.addEventListener("change", render);
qEl.addEventListener("input", render);
render();
