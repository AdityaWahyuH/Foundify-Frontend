// ===== Points Page Logic - Foundify =====
import {
  requireAuth,
  logout,
  readJSON,
  getTotalPoints
} from "./utils.js";

// --- Auth Guard ---
const auth = requireAuth();
if (!auth) return;

// --- Topbar user ---
const userPillText = document.getElementById("userPillText");
if (userPillText) {
  userPillText.textContent = `${auth.username} (${auth.role})`;
}

// --- Logout ---
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", logout);
}

// --- Tampilkan menu admin jika role admin ---
if (auth.role === "admin") {
  const adminClaims = document.getElementById("adminClaimsLink");
  const adminRewards = document.getElementById("adminRewardsLink");
  const adminRedeem = document.getElementById("adminRedeemLink");

  if (adminClaims) adminClaims.style.display = "flex";
  if (adminRewards) adminRewards.style.display = "flex";
  if (adminRedeem) adminRedeem.style.display = "flex";
}

// --- Ambil data poin ---
const points = readJSON("foundify_points", []);
const myPoints = points.filter(p => p.username === auth.username);

// --- Ringkasan ---
const totalPointsEl = document.getElementById("totalPoints");
const totalHistoryEl = document.getElementById("totalHistory");

if (totalPointsEl) {
  totalPointsEl.textContent = getTotalPoints(auth.username);
}

if (totalHistoryEl) {
  totalHistoryEl.textContent = myPoints.length;
}

// --- List Riwayat ---
const listEl = document.getElementById("pointsList");

function renderHistory() {
  if (!listEl) return;

  if (myPoints.length === 0) {
    listEl.innerHTML = `
      <div class="cardx">
        <div class="label">Riwayat Poin</div>
        <div class="small">Belum ada riwayat poin.</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = myPoints
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(p => `
      <div class="point">
        <div>
          <div style="font-weight:900;">${p.note || "-"}</div>
          <div class="small">
            ${new Date(p.created_at).toLocaleString()}
          </div>
        </div>
        <div class="delta">
          ${p.delta > 0 ? "+" : ""}${p.delta}
        </div>
      </div>
    `)
    .join("");
}

// --- Initial Render ---
renderHistory();
