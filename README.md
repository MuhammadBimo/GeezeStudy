# GeezeStudy

Platform produktivitas akademik dengan gamifikasi ringan untuk pelajar SD, SMP, SMA, dan mahasiswa.
GeezeStudy **bukan LMS**: ia mendampingi tugas, jadwal, dan kebiasaan belajar yang datang dari LMS atau sekolah.

Gamifikasi hanya memakai lima komponen: **Points, Level, Streak, Missions, Achievements**.

## Status

Frontend selesai sebagai **demo** (data contoh, belum tersambung ke server).
Backend Laravel (API lengkap + tes) sudah ada dan berjalan sendiri; **menyambungkan frontend ke API adalah langkah berikutnya**.

## Menjalankan backend

Syarat: PHP 8.3, Composer, MySQL (Laragon). Database `geezestudy`, atur di `backend/.env`.

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate   # lewati bila .env sudah ada
php artisan migrate --seed
php artisan serve --port=8010
php artisan test
```

Akun contoh (hanya di `APP_ENV=local`): ``admin@`, `sd@`, `smp@`, `sma@`, `mahasiswa@` + `geezestudy.test`, password `password123`.

Autentikasi memakai Sanctum cookie (SPA): panggil `GET /sanctum/csrf-cookie`, lalu `POST /api/login`.
Fitur: auth + verifikasi email + reset password, tugas, kalender, sesi belajar, goals, misi, progres/achievements,
teman, notifikasi, dan Panel Admin (`/api/admin/*`). Points, level, dan streak dihitung **hanya di server**
(satu sumber hanya memberi Points sekali, sesi divalidasi durasi/tumpang tindih/batas harian).

## Menjalankan frontend

Syarat: Node.js 22 atau lebih baru.

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173. Di Windows, klik dua kali `jalankan-geezestudy.bat` di folder root.

Perintah lain: `npm run lint`, `npm run build`.

## Mencoba demo

Di halaman **Masuk**, isi apa saja, atau pakai tombol cepat:

- **Coba tanpa akun**: masuk sebagai Student.
- **Coba sebagai Admin**: membuka Panel Admin (pengguna, misi, Points & Level, achievements, pengumuman, log).
- **Daftar** dengan email untuk melihat alur verifikasi email dan onboarding.

Profil demo hanya disimpan di browser (localStorage). Tombol **Keluar** menghapusnya.

## Fitur yang sudah ada di UI

Student: Dashboard, Tugas (detail, tambah, ubah, hapus, status), Kalender (bulan/minggu/hari), Study Timer
(pulih setelah dimuat ulang), Goals, Misi, Progres dan Achievements, Teman, Notifikasi (preferensi dan jam tenang),
Pengaturan (profil, target harian, privasi, sinkron Google Calendar satu arah).

Alur akun: masuk, daftar, lupa dan atur ulang password, verifikasi email, onboarding.

Admin: ringkasan, kelola pengguna, misi, aturan Points dan ambang Level, achievements, pengumuman, log.

## Teknologi

- Frontend: React 19, Vite, Tailwind CSS v4, React Router, Motion, Lucide.
- Backend: Laravel 13, Sanctum, MySQL.
- Desain: Colorful Neobrutalism. Mendukung `prefers-reduced-motion`, navigasi keyboard, dan responsif.

## Struktur

```
frontend/src
├── components/   ui, layout, dashboard, tasks
├── pages/        halaman Student, auth/, admin/
├── context/      auth demo, pengumuman
├── hooks/        useAuth, useToast, useAnnouncements
└── lib/          navigasi, tanggal, data contoh
backend/          Laravel API (app/Services = aturan Points, misi, achievements, streak)
```

## Deploy

GitHub Pages lewat `.github/workflows/deploy.yml` (frontend saja, base path `/GeezeStudy/`).
Aktifkan di Settings, Pages, Source: GitHub Actions.
