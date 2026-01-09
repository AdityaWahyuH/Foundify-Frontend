// ===== Foundify Utilities (localStorage + auth + notify) =====

export function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAuth() {
  return readJSON("foundify_auth", null);
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

export function pushNotification({ to, title, message, meta = {} }) {
  const list = readJSON("foundify_notifications", []);
  list.unshift({
    id: Date.now(),
    to,
    title,
    message,
    meta,
    is_read: false,
    created_at: new Date().toISOString()
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
  const updated = list.map(n => (n.to === username ? { ...n, is_read: true } : n));
  writeJSON("foundify_notifications", updated);
}

export function addPoints(username, delta, note) {
  const points = readJSON("foundify_points", []);
  points.unshift({
    id: Date.now(),
    username,
    delta: Number(delta),
    note,
    created_at: new Date().toISOString()
  });
  writeJSON("foundify_points", points);

  // notif poin
  pushNotification({
    to: username,
    title: "Update Poin",
    message: `${note} (${delta > 0 ? "+" : ""}${delta} poin)`,
    meta: { type: "points" }
  });
}

export function getTotalPoints(username) {
  const points = readJSON("foundify_points", []);
  return points
    .filter(p => p.username === username)
    .reduce((sum, p) => sum + Number(p.delta || 0), 0);
}
