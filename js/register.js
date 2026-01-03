// ===== Register Page Logic (Vanilla JS) =====

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const googleBtn = document.getElementById("googleBtn");

  const getErrorEl = (fieldId) =>
    document.querySelector(`[data-error-for="${fieldId}"]`);

  const setError = (fieldId, message) => {
    const el = getErrorEl(fieldId);
    if (el) el.textContent = message || "";
  };

  const clearErrors = () => {
    setError("username", "");
    setError("password", "");
  };

  const hasUpper = (s) => /[A-Z]/.test(s);
  const hasLower = (s) => /[a-z]/.test(s);

  const validate = () => {
    clearErrors();
    let ok = true;

    const u = username.value.trim();
    const p = password.value.trim();

    if (!u) {
      setError("username", "Username wajib diisi.");
      ok = false;
    } else if (u.length < 3) {
      setError("username", "Username minimal 3 karakter.");
      ok = false;
    }

    if (!p) {
      setError("password", "Password wajib diisi.");
      ok = false;
    } else if (p.length < 8) {
      setError("password", "Password minimal 8 karakter.");
      ok = false;
    } else if (!hasUpper(p) || !hasLower(p)) {
      setError("password", "Password harus mengandung huruf besar dan huruf kecil.");
      ok = false;
    }

    return ok;
  };

  togglePassword.addEventListener("click", () => {
    const isHidden = password.type === "password";
    password.type = isHidden ? "text" : "password";
    togglePassword.setAttribute(
      "aria-label",
      isHidden ? "Sembunyikan password" : "Tampilkan password"
    );
  });

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Simulasi register (nanti diganti call REST API ke backend)
    // Simpan user dummy ke localStorage
    const newUser = {
      username: username.value.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("foundify_registered_user", JSON.stringify(newUser));

    alert("Register berhasil! Silakan login.");
    window.location.href = "../pages/login.html";
  });

  googleBtn.addEventListener("click", () => {
    alert("Google Register belum diimplementasikan (placeholder).");
  });
});
