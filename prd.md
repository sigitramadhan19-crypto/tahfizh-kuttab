# DOKUMEN PERSYARATAN PRODUK (PRD)

**Nama Produk:** Tahfizh Kuttab ZAD
**Platform:** Progressive Web Application (PWA - Mobile-First)
**Tech Stack:** Next.js, PostgreSQL, Prisma ORM, Tailwind CSS, shadcn/ui

---

## 1. Ringkasan Eksekutif (Executive Summary)

Aplikasi "Rekap Tahfizh Kuttab" adalah sistem manajemen pembelajaran mutakhir untuk mencatat dan memantau capaian hafalan Al-Quran siswa. Meninggalkan batasan sistem berbasis *spreadsheet*, aplikasi ini dibangun dengan arsitektur web modern yang menjamin integritas data tingkat tinggi, waktu muat (*loading*) instan, dan antarmuka pengguna (UI/UX) premium. Sistem ini dirancang sebagai *Progressive Web App* (PWA) sehingga guru dapat menggunakannya dengan mulus di perangkat seluler mereka, sementara Kepala Sekolah memiliki akses ke dasbor analitik waktu-nyata (*real-time*) tanpa kendala performa.

## 2. Tujuan & Sasaran (Goals & Objectives)

* **Pengalaman Pengguna (UX) Premium:** Memangkas waktu input data oleh guru dengan antarmuka yang sangat responsif, fitur *autocomplete*, dan perpindahan halaman tanpa *loading* ulang (SPA).
* **Integritas & Skalabilitas Data:** Menggunakan *database* relasional (PostgreSQL) yang menjamin data tidak akan rusak, hilang, atau bertabrakan ketika banyak guru melakukan input secara bersamaan.
* **Analitik Instan:** Menghilangkan ketergantungan pada formula *spreadsheet* yang berat; sistem baru menghitung rekapitulasi data makro dalam hitungan milidetik.

## 3. Pengguna (User Personas)

1. **Guru (Pengguna Mikro):** Menggunakan aplikasi via *smartphone* (di- *install* ke *homescreen* via PWA). Membutuhkan antarmuka dengan tombol besar yang ramah sentuhan, mode gelap/terang, dan alur kerja minim klik.
2. **Kepala Sekolah / Staff TU (Pengguna Makro):** Mengakses via *laptop/tablet*. Membutuhkan tabel data yang kaya (bisa diurutkan, disaring, diekspor) dan visualisasi grafik yang interaktif.

---

## 4. Kebutuhan Fungsional (Functional Requirements)

### 4.1. Autentikasi & Keamanan (NextAuth.js)

* **Login Bebas Hambatan:** Login menggunakan *Username/PIN* atau *Magic Link* yang sangat cepat.
* **Manajemen Sesi Cerdas:** Sesi pengguna dipertahankan secara aman menggunakan JWT (*JSON Web Tokens*), menghilangkan kebutuhan login berulang setiap kali membuka aplikasi.
* **Role-Based Access Control (RBAC):** Proteksi tingkat halaman dan tingkat API. Jika Guru mencoba mengakses tautan Dasbor Kepsek, sistem akan otomatis mengarahkan kembali secara elegan.

### 4.2. Modul Guru (Input & Navigasi Harian)

* **UI Navigasi Bawah (Bottom Navigation):** Mengadopsi gaya aplikasi *mobile* modern (Home, Input, Riwayat) yang selalu menempel di layar bawah.
* **Form Input Cerdas (Combobox & Stepper):**
* Pengganti *dropdown* standar: Menggunakan komponen **Combobox** (dapat diketik untuk mencari nama surat dengan cepat).
* **Logika Dinamis Halus:** Transisi saat memilih "Iqra" vs "Al-Quran" dilakukan dengan animasi yang mulus.
* **State Management:** Jika guru belum selesai mengisi form namun berpindah tab, data form tidak hilang (*persisted state*).


* **Riwayat Interaktif:** Menggunakan *Infinite Scroll* (gulir tanpa batas) atau *Pagination* mulus untuk melihat riwayat setoran siswa, disertai kemampuan edit/hapus data dalam 24 jam terakhir (jika terjadi salah input).

### 4.3. Modul Kepala Sekolah (Dasbor & Analitik)

* **Dasbor Waktu-Nyata:** Metrik seperti Total Capaian Hafalan dan Distribusi Tilawah diperbarui secara instan tanpa perlu memuat ulang halaman.
* **Tabel Data Modern (Data Table):** Menggunakan pustaka seperti *TanStack Table* yang memungkinkan:
* Filter multi-kolom yang kompleks.
* *Sorting* (pengurutan) seketika.
* Ekspor ke Excel/PDF dalam satu klik.


* **Grafik Interaktif:** Menggunakan pustaka visualisasi modern (seperti *Recharts*) untuk menampilkan *tooltip* detail saat grafik disentuh (*hover*).

---

## 5. Arsitektur Database (PostgreSQL via Prisma Schema)

Berikut adalah struktur *database* relasional sejati, menghilangkan redudansi dan keterbatasan Sheet:

| Model (Tabel) | Kolom Utama & Relasi | Keterangan |
| --- | --- | --- |
| `User` | `id`, `name`, `username`, `password`, `role` | Data autentikasi dan profil pengguna. |
| `Class` | `id`, `name`, `teacherId` (FK) | Entitas kelas. Relasi 1:1 atau 1:N dengan `User` (Guru). |
| `Student` | `id`, `name`, `classId` (FK), `statusTilawah`, `totalJuz`, `isActive` | Data induk siswa. Relasi N:1 dengan `Class`. |
| `DepositLog` | `id`, `timestamp`, `studentId` (FK), `category`, `bookType`, `sourceMaterial`, `startDetail`, `endDetail`, `grade` | Tabel transaksional. Menggunakan tipe data enum (`Tahfizh`, `Iqra`, dll) di tingkat *database* untuk validasi ketat. |

*Catatan: Tidak ada lagi Sheet `Rekap_Live`. Rekapitulasi (seperti posisi hafalan terakhir) diambil menggunakan SQL Query berbasis Waktu (cth: `ORDER BY timestamp DESC LIMIT 1`) secara instan melalui API.*

---

## 6. Antarmuka & Pengalaman Pengguna (UI/UX)

* **Sistem Desain:** Dibangun dengan **shadcn/ui** (berbasis Tailwind). Menawarkan komponen siap pakai yang terlihat sangat profesional, minim gaya kaku, dan memiliki dukungan aksesibilitas (WAI-ARIA) bawaan.
* **Skeleton Loaders:** Daripada menampilkan layar kosong dengan teks *loading* atau *spinner* di tengah layar, aplikasi akan menampilkan *Skeleton UI* (kerangka bayangan komponen) saat mengambil data, memberikan ilusi bahwa aplikasi memuat lebih cepat.
* **Interaksi Optimistis (Optimistic UI):** Saat guru menekan "Simpan", UI akan langsung menunjukkan keberhasilan secara instan sambil memproses data di latar belakang, memberikan kesan aplikasi "tanpa jeda waktu" (*zero latency*).
* **Toast Notifications:** Sistem notifikasi mengambang di pojok layar yang hilang sendiri dalam 3 detik, sangat informatif namun tidak mengganggu.

---

## 7. Fase Implementasi (Workflow)

Pengembangan dapat dibagi ke dalam iterasi yang berpusat pada fitur (*Feature-Driven Development*):

* **Fase 1 (Infrastruktur & Skema):** Inisiasi proyek Next.js. Menyiapkan *database* PostgreSQL (Supabase). Mendefinisikan skema Prisma dan menjalankan migrasi awal. Setup Tailwind CSS.
* **Fase 2 (Autentikasi & Inti API):** Menerapkan NextAuth untuk login. Membuat rute API dasar untuk operasi CRUD (Ambil data siswa, input setoran).
* **Fase 3 (PWA & Antarmuka Guru):** Mengonfigurasi manifes PWA. Membangun tata letak ramah seluler. Mengimplementasikan form dinamis (*Combobox*, transisi) dan menghubungkannya dengan API menggunakan state *React Query*.
* **Fase 4 (Dasbor Analitik Kepsek):** Membangun antarmuka *desktop*. Menulis kueri agregasi di Prisma untuk menarik data analitik. Mengintegrasikan *TanStack Table* dan grafik (*Recharts*).
* **Fase 5 (Testing & Rilis):** Uji coba pada berbagai ukuran layar (*responsiveness*). *Deployment* melalui sistem *CI/CD* untuk kemudahan *update* di masa depan.

---

## 8. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Kinerja:** API harus merespons di bawah 200ms. Karena di- *deploy* di infrastruktur modern, tidak ada lagi batasan 6 menit eksekusi seperti pada Apps Script.
* **Keamanan:** Aplikasi menerapkan perlindungan CSRF (Cross-Site Request Forgery) dan XSS bawaan dari Next.js. *Database* tidak dapat diakses langsung dari luar (*Environment Variables* disembunyikan di *server*).
* **Koneksi Database:** Menggunakan *Connection Pooling* agar *database* tidak tumbang (*crash*) jika seluruh guru di sekolah membuka aplikasi dan mengirim data di detik yang sama.
