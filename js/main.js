// Foundify Landing Page - Vanilla JS

document.addEventListener("DOMContentLoaded", () => {
  const btnRegister = document.getElementById("btnRegister");
  const btnLogin = document.getElementById("btnLogin");
  const btnStart = document.getElementById("btnStart");

  // Tombol Register -> arahkan ke halaman register
  btnRegister.addEventListener("click", () => {
    window.location.href = "./pages/register.html";
  });

  // Tombol Login -> arahkan ke halaman login
  btnLogin.addEventListener("click", () => {
    window.location.href = "./pages/login.html";
  });

  // Tombol Mulai Temukan Barang -> (sementara) arahkan ke halaman list barang / dashboard
  btnStart.addEventListener("click", () => {
    // kalau belum ada halamannya, bisa tetap ke login dulu
    // atau arahkan ke list barang (nanti dibuat)
    window.location.href = "./pages/login.html";
    // alternatif:
    // window.location.href = "./pages/dashboard.html";
    // window.location.href = "./pages/barang-hilang.html";
  });
});
