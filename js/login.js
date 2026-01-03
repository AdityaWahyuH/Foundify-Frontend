// ===== Login Page Logic (VALID sesuai Backend Seeder) =====

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // ===============================
  // DATA USER & ADMIN (SIMULASI BACKEND)
  // ===============================
  const USERS = [
    // ADMIN
    {
      username: "superadmin",
      password: "admin123",
      role: "admin",
      nama: "Super Admin Foundify",
      email: "admin@foundify",
    },
    {
      username: "admin2",
      password: "admin123",
      role: "admin",
      nama: "Admin Dua",
      email: "admin2@foundify",
    },

    // USER
    {
      username: "aditya",
      password: "password123",
      role: "user",
      nama: "Aditya Wahyu Hidayatullah",
      email: "aditywh@gmail.com",
    },
    {
      username: "fikri",
      password: "password123",
      role: "user",
      nama: "Mohamad Fikri Isfahani",
      email: "fikri@gmail.com",
    },
    {
      username: "joe",
      password: "password123",
      role: "user",
      nama: "Joe Petra",
      email: "joe@gmail.com",
    },
    {
      username: "abel",
      password: "password123",
      role: "user",
      nama: "Abel Chrisnaldi",
      email: "abel@gmail.com",
    },
  ];

  // ===============================
  // ERROR HANDLING
  // ===============================
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

  // ===============================
  // TOGGLE PASSWORD
  // ===============================
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
  });

  // ===============================
  // SUBMIT LOGIN
  // ===============================
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username) {
      setError("username", "Username wajib diisi");
      return;
    }

    if (!password) {
      setError("password", "Password wajib diisi");
      return;
    }

    // ===============================
    // CEK KE "DATABASE" (ARRAY USERS)
    // ===============================
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      setError("password", "Username atau password salah");
      return;
    }

    // ===============================
    // LOGIN BERHASIL
    // ===============================
    const authPayload = {
      username: user.username,
      nama: user.nama,
      email: user.email,
      role: user.role, // admin / user
      token: "dummy-token-" + Date.now(),
    };

    localStorage.setItem("foundify_auth", JSON.stringify(authPayload));

    // Redirect ke Home / Dashboard
    window.location.href = "../pages/dashboard.html";
  });
});
