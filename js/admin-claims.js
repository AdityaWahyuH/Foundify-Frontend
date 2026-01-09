import { requireAuth, logout, readJSON, writeJSON, addPoints, pushNotification } from "./utils.js";

const auth = requireAuth();
if (auth.role !== "admin") window.location.href = "./dashboard.html";

document.getElementById("userPillText").textContent = `${auth.username} (admin)`;
document.getElementById("btnLogout").addEventListener("click", logout);

function getClaims(){ return readJSON("foundify_claims", []); }
function saveClaims(arr){ writeJSON("foundify_claims", arr); }

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
    const img = c.proof_image ? `<img src="${c.proof_image}" alt="bukti" style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;margin-top:10px;">` : "";
    return `
      <div class="claim" data-id="${c.id}" style="background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:12px;">
        <div style="display:flex;justify-content:space-between;gap:10px;font-weight:1000;">
          <div>${c.claimant} <span style="font-size:12px;font-weight:900;color:rgba(15,23,42,.65);">(${c.status})</span></div>
          <div style="font-size:12px;font-weight:900;color:rgba(15,23,42,.65);">${new Date(c.created_at).toLocaleString()}</div>
        </div>

        <div style="margin-top:6px;font-weight:900;color:rgba(15,23,42,.75);"><b>Item:</b> ${c.item_title}</div>
        <div style="margin-top:6px;font-size:12px;font-weight:900;color:rgba(15,23,42,.65);"><b>Bukti:</b> ${c.proof_text}</div>
        ${img}

        ${
          c.status === "PENDING"
            ? `<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
                <button class="btn btn--ghost" data-act="reject" style="padding:10px 14px;border-radius:10px;font-weight:1000;border:1px solid rgba(15,23,42,.12);background:#fff;cursor:pointer;">Reject</button>
                <button class="btn btn--primary" data-act="approve" style="padding:10px 14px;border-radius:10px;font-weight:1000;border:none;background:var(--primary);color:#fff;cursor:pointer;">Approve</button>
              </div>`
            : `<div style="margin-top:10px;font-size:12px;font-weight:900;color:rgba(15,23,42,.65);">Diverifikasi oleh: <b>${c.verified_by || "-"}</b></div>`
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
    claims[idx] = c;
    saveClaims(claims);

    // notif claimant
    pushNotification({
      to: c.claimant,
      title: "Klaim Disetujui",
      message: `Klaim kamu untuk item "${c.item_title}" disetujui admin.`,
      meta: { type:"claim", status:"APPROVED" }
    });

    // reward poin ke pelapor item (biasanya penemu saat FOUND)
    // gunakan coins default 10 jika tidak ada
    const rewardCoins = Number(c.item_coins || 10);
    addPoints(c.item_author, rewardCoins, `Reward klaim item: ${c.item_title}`);

    render();
  }

  if (act === "reject") {
    c.status = "REJECTED";
    c.verified_by = auth.username;
    c.verified_at = new Date().toISOString();
    claims[idx] = c;
    saveClaims(claims);

    pushNotification({
      to: c.claimant,
      title: "Klaim Ditolak",
      message: `Klaim kamu untuk item "${c.item_title}" ditolak admin.`,
      meta: { type:"claim", status:"REJECTED" }
    });

    render();
  }
});

document.getElementById("btnRefresh").addEventListener("click", render);
filterStatus.addEventListener("change", render);
q.addEventListener("input", render);

render();
