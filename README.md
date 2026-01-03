# Foundify – Lost & Found Platform (Frontend)

Foundify adalah aplikasi **Lost & Found berbasis web** yang bertujuan membantu pengguna melaporkan, mencari, dan menemukan barang hilang atau ditemukan secara cepat dan terstruktur.  
Project ini dibangun menggunakan **HTML, CSS, dan JavaScript (Vanilla)** sebagai bagian dari implementasi frontend.

---

## 🚀 Fitur Utama

### 🔐 Autentikasi
- Login & Register user
- Role **Admin** dan **User**
- Proteksi halaman (Dashboard & Report hanya bisa diakses setelah login)

### 🏠 Landing Page
- Informasi singkat tentang Foundify
- Tombol Login & Register
- Call-to-action untuk mulai menggunakan aplikasi

### 📊 Dashboard (Home)
- Menampilkan daftar barang **LOST** dan **FOUND**
- Filter berdasarkan:
  - Status (All / Lost / Found)
  - Lokasi
  - Kategori barang
  - Pencarian kata kunci
- Pagination (Load More)
- Tampilan kartu (card) dengan:
  - Status barang
  - Nama barang
  - Kategori
  - Deskripsi
  - Lokasi
  - Tanggal
  - Poin/Coins

### 📝 Buat Laporan / Report
- Form laporan barang **hilang atau ditemukan**
- Input:
  - Status (Lost / Found)
  - Kategori
  - Nama barang
  - Deskripsi
  - Lokasi
  - Tanggal kejadian
  - Poin (opsional)
  - Kontak (opsional)
  - Upload gambar + preview
- Validasi input form
- Data laporan disimpan di `localStorage`

### 🔓 Logout
- Menghapus session login
- Redirect ke landing page

---

## 🧱 Teknologi yang Digunakan

- **HTML5**
- **CSS3**
- **JavaScript (Vanilla JS)**
- **LocalStorage** (simulasi session & data)
- Backend (Laravel) → **belum diintegrasikan langsung**, hanya simulasi frontend

---

## 📁 Struktur Folder

```text
Foundify-Frontend/
│
├── index.html               # Landing Page
│
├── pages/
│   ├── login.html           # Login Page
│   ├── register.html        # Register Page
│   ├── dashboard.html       # Dashboard (Home)
│   └── report.html          # Buat Laporan / Report
│
├── css/
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   └── report.css
│
├── js/
│   ├── main.js              # Landing Page logic
│   ├── login.js             # Login logic
│   ├── register.js          # Register logic
│   ├── dashboard.js         # Dashboard logic & filter
│   └── report.js            # Report form logic
│
└── README.md

````

---

## 👥 Akun Dummy (Simulasi Backend)

### Admin

| Username   | Password |
| ---------- | -------- |
| superadmin | admin123 |
| admin2     | admin123 |

### User

| Username | Password    |
| -------- | ----------- |
| aditya   | password123 |
| fikri    | password123 |
| joe      | password123 |
| abel     | password123 |

---

## ▶️ Cara Menjalankan Project

1. Clone / download repository
2. Buka folder `Foundify-Frontend`
3. Jalankan menggunakan:

   * Live Server (VS Code Extension), atau
   * Buka `index.html` langsung di browser
4. Login menggunakan akun dummy di atas
5. Akses Dashboard dan Buat Laporan
