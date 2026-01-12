// ===== Utils - Foundify (Shared FINAL) =====

/* ======================================================
   1) Storage Helpers
====================================================== */
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("readJSON error:", key);
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function nowISO() {
  return new Date().toISOString();
}


/* ======================================================
   2) Auth Helpers
====================================================== */
export function getAuth() {
  const raw = localStorage.getItem("foundify_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function requireAuth(redirect = "../pages/login.html") {
  const auth = getAuth();
  if (!auth || !auth.token) {
    window.location.href = redirect;
    return null;
  }
  return auth;
}

export function logout() {
  localStorage.removeItem("foundify_auth");
  window.location.href = "../index.html";
}


/* ======================================================
   3) Points System (GLOBAL)
====================================================== */
export function getTotalPoints(username) {
  const list = readJSON("foundify_points", []);
  return list
    .filter(p => p.username === username)
    .reduce((sum, p) => sum + Number(p.delta || 0), 0);
}

/**
 * Tambah riwayat poin (positif / negatif)
 */
export function addPointHistory(username, delta, note = "-") {
  const list = readJSON("foundify_points", []);
  list.unshift({
    id: `PTS-${Date.now()}`,
    username,
    delta: Number(delta),
    note,
    created_at: nowISO()
  });
  writeJSON("foundify_points", list);
  return true;
}

/**
 * Kurangi poin user (dipakai saat redeem)
 */
export function spendPoints(username, amount, note) {
  const total = getTotalPoints(username);
  const cost = Number(amount || 0);

  if (total < cost) return false;

  addPointHistory(
    username,
    -Math.abs(cost),
    note || "Penukaran reward"
  );

  return true;
}


/* ======================================================
   4) Notifications (Optional tapi siap pakai)
====================================================== */
export function pushNotification({ to, title, message, meta = {} }) {
  const list = readJSON("foundify_notifications", []);
  list.unshift({
    id: `NTF-${Date.now()}`,
    to,
    title,
    message,
    meta,
    is_read: false,
    created_at: nowISO()
  });
  writeJSON("foundify_notifications", list);
}

export function getMyNotifications(username) {
  const list = readJSON("foundify_notifications", []);
  return list.filter(n => n.to === username);
}

export function getUnreadCount(username) {
  return getMyNotifications(username).filter(n => !n.is_read).length;
}

export function markAllRead(username) {
  const list = readJSON("foundify_notifications", []);
  const updated = list.map(n =>
    n.to === username ? { ...n, is_read: true } : n
  );
  writeJSON("foundify_notifications", updated);
}


/* ======================================================
   5) Safety Seeder (Optional)
====================================================== */
export function ensureArray(key) {
  const val = readJSON(key, null);
  if (!Array.isArray(val)) writeJSON(key, []);
}
