function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function requireAuth() {
  const auth = readJSON("foundify_auth", null);
  if (!auth || !auth.token) {
    window.location.href = "../pages/login.html";
    return null;
  }
  return auth;
}

const auth = requireAuth();
document.getElementById("userPillText").textContent = `${auth.username} (${auth.role})`;

if (auth.role === "admin") {
  document.getElementById("adminClaimsLink").style.display = "flex";
}

document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
});

const points = readJSON("foundify_points", []);
const my = points.filter(p => p.username === auth.username);

const total = my.reduce((sum, p) => sum + Number(p.delta || 0), 0);
document.getElementById("totalPoints").textContent = total;
document.getElementById("totalHistory").textContent = my.length;

const list = document.getElementById("pointsList");
if (my.length === 0) {
  list.innerHTML = `<div style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;font-weight:900;color:rgba(15,23,42,.6);">Belum ada riwayat poin.</div>`;
} else {
  list.innerHTML = my.map(p => `
    <div class="point">
      <div>
        <div style="font-weight:900;">${p.note || "-"}</div>
        <div class="small">${new Date(p.created_at).toLocaleString()}</div>
      </div>
      <div class="delta">+${p.delta}</div>
    </div>
  `).join("");
}
