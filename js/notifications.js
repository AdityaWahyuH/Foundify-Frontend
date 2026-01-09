import { requireAuth, logout, readJSON, writeJSON, markAllRead, getMyNotifications } from "./utils.js";

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

const listEl = document.getElementById("notifList");

function render() {
  const mine = getMyNotifications(auth.username);
  if (mine.length === 0) {
    listEl.innerHTML = `<div style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;font-weight:900;color:rgba(15,23,42,.6);">Belum ada notifikasi.</div>`;
    return;
  }

  listEl.innerHTML = mine.map(n => `
    <div class="notif ${n.is_read ? "" : "unread"}">
      <div class="top">
        <div class="title">${n.title}</div>
        <div class="small">${new Date(n.created_at).toLocaleString()}</div>
      </div>
      <div class="msg">${n.message}</div>
    </div>
  `).join("");
}

document.getElementById("btnMarkAll").addEventListener("click", () => {
  markAllRead(auth.username);
  render();
});

render();
