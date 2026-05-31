# 🕌 Jam Masjid Digital TV

**Jam Masjid Digital TV** adalah sistem papan informasi digital modern premium yang dirancang khusus untuk layar TV Masjid/Musholla. Aplikasi ini menyediakan informasi waktu shalat real-time, hitung mundur iqomah, pengumuman berjalan, poster banner dinamis, hingga kata-kata mutiara Islami, lengkap dengan **Panel Kontrol Admin** yang responsif dan mudah digunakan.

---

## ✨ Fitur Utama

### 🖥️ Tampilan TV Utama (Smart TV Display)
* **Jam & Detik Presisi**: Tampilan jam digital besar real-time yang sangat mudah dibaca dari jarak jauh.
* **Sistem Kalender Ganda**: Menampilkan penanggalan Masehi dan Hijriah secara akurat, lengkap dengan penyesuaian pergantian hari Islam secara otomatis setelah masuk waktu Maghrib (*Maghrib Rollover*).
* **Jadwal Shalat 5 Waktu + Imsak & Syuruq**: Jadwal otomatis yang akurat menggunakan formula astronomi berdasarkan koordinat geografis masjid Anda.
* **Hitung Mundur Dinamis**: Menghitung mundur waktu menuju kumandang adzan berikutnya secara real-time.
* **Tema Gradasi Menawan**: Warna latar belakang gradasi premium yang berubah secara otomatis berdasarkan waktu shalat terdekat untuk memberikan nuansa visual yang segar dan hidup.
* **Slideshow Galeri Latar Belakang**: Mendukung banyak gambar latar belakang berkualitas tinggi dengan transisi *fade* yang halus.
* **Running Text Pengumuman**: Teks ticker berjalan di bagian bawah layar untuk pengumuman penting masjid.
* **Pengingat Puasa Sunnah Otomatis**: Menampilkan pengingat otomatis untuk puasa Senin-Kamis serta Ayyamul Bidh (13, 14, 15 Hijriah) di baris teks berjalan.
* **Efek Alarm Adzan & Tarhim**: Memutar audio Tarhim otomatis sebelum Subuh dan audio Adzan merdu ketika masuk waktu shalat.
* **Optimalisasi Layar Kiosk**: Didukung fitur *Wake Lock API* untuk mencegah layar Smart TV meredup atau tidur (*sleep*), serta fitur sembunyikan kursor mouse otomatis.
* **Alur Transisi Ibadah Otomatis**:
  1. **Layar Normal**: Menampilkan jam, jadwal shalat, pengumuman, dan slideshow latar belakang.
  2. **Layar Adzan**: Muncul ketika waktu shalat tiba, memutar adzan dan menampilkan hitung mundur durasi adzan.
  3. **Layar Iqomah**: Menampilkan hitung mundur waktu iqomah (dapat disesuaikan secara unik per waktu shalat).
  4. **Layar Shalat (Blank Screen)**: Layar meredup menjadi gelap gulita selama durasi shalat berlangsung agar tidak mengganggu kekhusyukan jamaah.

### ⚙️ Panel Kontrol Admin (Responsive Admin Panel)
* **Keamanan Server-Side**: Autentikasi aman berbasis enkripsi *cookie session* di sisi server Next.js.
* **Pengaturan Identitas Masjid**: Ubah nama masjid, alamat, dan pilih lokasi koordinat geografis (Latitude & Longitude) menggunakan **Map Picker** terintegrasi.
* **Kustomisasi Durasi & Offset**:
  * Durasi alarm adzan, durasi shalat (layar mati), serta durasi iqomah yang unik untuk masing-masing waktu shalat (misal: Subuh 10 menit, Maghrib 7 menit).
  * Fitur koreksi jadwal waktu shalat (*offset minutes*) jika ingin mencocokkan jadwal lokal.
* **Manajemen Slide Latar Belakang**: Aktifkan/nonaktifkan slideshow, atur jeda waktu transisi gambar, dan kelola galeri gambar latar belakang.
* **Pengumuman Ticker & Banner**:
  * Tulis, edit, aktifkan/nonaktifkan pengumuman berjalan.
  * Kelola banner poster full-screen (mode gambar atau teks gradasi) lengkap dengan pengatur durasi tampil otomatis.
* **Galeri Quotes Islami**: Kelola kumpulan kutipan hadits atau ayat pilihan yang bergantian tampil elegan di bawah jam utama.
* **Dev Sandbox Simulator**: Simulator canggih interaktif khusus pengembang/teknisi untuk menguji transisi layar (*Normal -> Adzan -> Iqomah -> Shalat*) secara instan tanpa perlu menunggu waktu aslinya tiba.

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

* **Framework Utama**: Next.js 15 (App Router) dengan TypeScript.
* **Bahasa**: HTML, CSS, JavaScript, TypeScript.
* **Desain & Animasi**: Tailwind CSS, Lucide React Icons, Framer Motion (`motion`).
* **Penyimpanan Data**: PostgreSQL database (menggunakan Pool koneksi `pg`).
* **Logika Penanggalan & Waktu**: `date-fns`, `date-fns-tz`, dan pustaka jadwal astronomi `adhan`.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 📋 Prasyarat
Sebelum memulai, pastikan perangkat Anda telah terinstal:
* [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
* Database [PostgreSQL](https://www.postgresql.org/) (bisa menggunakan PostgreSQL lokal atau layanan cloud seperti Neon DB / Supabase)

### 💻 Langkah Instalasi

1. **Clone Repositori**:
   Buka terminal Anda dan masuk ke direktori proyek.

2. **Instal Dependensi**:
   Jalankan perintah berikut untuk mengunduh modul-modul yang dibutuhkan:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Buat file `.env` di root direktori proyek Anda (atau salin dari `.env.example`). Tambahkan URL koneksi database PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/jam_masjid_db?sslmode=disable"
   ```

4. **Inisialisasi Database**:
   Aplikasi ini dilengkapi dengan modul inisialisasi skema otomatis (*automatic schema initialization*) di `shared/lib/db.ts`. Saat pertama kali aplikasi dijalankan, tabel-tabel database akan dibuat dan data pengaturan awal (seperti nama masjid default) akan di-seed secara otomatis.

5. **Jalankan Aplikasi dalam Mode Pengembangan**:
   ```bash
   npm run dev
   ```

6. **Buka di Browser Anda**:
   * **Tampilan TV Utama**: Akses [http://localhost:3000](http://localhost:3000)
   * **Panel Kontrol Admin**: Akses [http://localhost:3000/admin](http://localhost:3000/admin) (Gunakan halaman registrasi bawaan saat pertama kali setup untuk mendaftarkan akun pengelola Anda).

---

## 📂 Struktur Folder Proyek

Proyek ini menggunakan arsitektur Next.js berbasis fitur (*Feature-Driven Architecture*) untuk menjaga kerapihan, skalabilitas, dan kemudahan pemeliharaan:

```text
├── app/                  # Routing Next.js App Router (Page & API endpoints)
├── features/             # Fitur modular aplikasi (domain-specific logic)
│   ├── admin/            # Komponen panel dashboard admin
│   ├── announcements/    # Pengumuman ticker & banner poster full-screen
│   ├── location/         # Map picker lokasi koordinat masjid
│   ├── prayer-times/     # Mesin jadwal shalat, jam, & layar transisi ibadah
│   ├── pwa/              # Konfigurasi PWA & penyelarasan data offline
│   ├── quotes/           # Pengelolaan kata-kata motivasi / kutipan hadits
│   └── settings/         # Pengaturan suara, durasi iqomah, & slideshow latar
├── shared/               # Kode global yang digunakan lintas fitur
│   ├── components/       # Komponen UI global (button, input, dll)
│   ├── constants/        # Nilai statis (skema warna, daftar audio, quote fallback)
│   ├── lib/              # Modul database postgres & otentikasi session JWT/Cookie
│   ├── types/            # Definisi tipe data TypeScript global
│   └── utils/            # Fungsi utilitas pembantu (kalkulasi puasa, dll)
├── public/               # Aset statis (ikon PWA, manifest, service worker)
└── package.json          # File konfigurasi npm & informasi dependensi
```

---

## 🔒 Catatan Keamanan & Kepatuhan
1. **Verifikasi Session**: Autentikasi pada panel admin sepenuhnya dilindungi dengan mekanisme penandatanganan cookie (*signed cookie*) di sisi server, memastikan tidak ada akses tidak sah ke panel kontrol.
2. **Fail-Closed Strategy**: Jika koneksi database terputus atau gagal verifikasi, sistem secara otomatis akan menggunakan data *fallback* (pengaturan lokal cadangan) agar tampilan TV masjid tetap berjalan mulus tanpa merusak pengalaman visual jamaah.
