function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function requireAuth() {
  const auth = readJSON("foundify_auth", null);
  if (!auth || !auth.token) {
    window.location.href = "../pages/login.html";
    return null;
  }
  if (auth.role !== "admin") {
    window.location.href = "./dashboard.html";
    return null;
  }
  return auth;
}

const auth = requireAuth();
document.getElementById("userPillText").textContent = `${auth.username} (admin)`;

document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
});

function addPoints(username, delta, note) {
  const points = readJSON("foundify_points", []);
  points.unshift({ id: Date.now(), username, delta, note, created_at: new Date().toISOString() });
  writeJSON("foundify_points", points);
}

function getClaims() { return readJSON("foundify_claims", []); }

const claimsList = document.getElementById("claimsList");
const filterStatus = document.getElementById("filterStatus");
const q = document.getElementById("q");

function render() {
  let claims = getClaims();

  const fs = filterStatus.value;
  if (fs !== "ALL") claims = claims.filter(c => c.status === fs);

  const qq = q.value.trim().toLowerCase();
  if (qq) {
    claims = claims.filter(c =>
      (c.claimant || "").toLowerCase().includes(qq) ||
      (c.item_title || "").toLowerCase().includes(qq)
    );
  }

  if (claims.length === 0) {
    claimsList.innerHTML = `<div style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;font-weight:900;color:rgba(15,23,42,.6);">Tidak ada klaim.</div>`;
    return;
  }

  claimsList.innerHTML = claims.map(c => {
    const img = c.proof_image ? `<img src="${c.proof_image}" alt="bukti">` : "";
    return `
      <div class="claim" data-id="${c.id}">
        <div class="top">
          <div>${c.claimant} <span class="small">(${c.status})</span></div>
          <div class="small">${new Date(c.created_at).toLocaleString()}</div>
        </div>
        <div class="small" style="margin-top:6px;"><b>Item:</b> ${c.item_title}</div>
        <div class="small" style="margin-top:6px;"><b>Bukti:</b> ${c.proof_text}</div>
        ${img}
        ${
          c.status === "PENDING"
            ? `<div class="actions">
                 <button class="btn btn--ghost" data-act="reject">Reject</button>
                 <button class="btn btn--primary" data-act="approve">Approve</button>
               </div>`
            : `<div class="small" style="margin-top:10px;">Diverifikasi oleh: <b>${c.verified_by || "-"}</b></div>`
        }
      </div>
    `;
  }).join("");
}

claimsList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const wrap = e.target.closest(".claim");
  if (!wrap) return;

  const id = Number(wrap.getAttribute("data-id"));
  const act = btn.getAttribute("data-act");

  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === id);
  if (idx === -1) return;

  const c = claims[idx];
  if (c.status !== "PENDING") return;

  if (act === "approve") {
    c.status = "APPROVED";
    c.verified_by = auth.username;
    c.verified_at = new Date().toISOString();

    // Reward ke pelapor item (item_author) — coins default 10 jika belum ada
    addPoints(c.item_author, 10, `Reward dari klaim item: ${c.item_title}`);
  }

  if (act === "reject") {
    c.status = "REJECTED";
    c.verified_by = auth.username;
    c.verified_at = new Date().toISOString();
  }

  claims[idx] = c;
  writeJSON("foundify_claims", claims);
  render();
});

document.getElementById("btnRefresh").addEventListener("click", render);
filterStatus.addEventListener("change", render);
q.addEventListener("input", render);

render();
