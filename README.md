# GeezeStudy

Platform produktivitas akademik dengan gamifikasi ringan untuk pelajar SD, SMP, SMA, dan mahasiswa.
GeezeStudy **bukan LMS**: ia mendampingi tugas, jadwal, dan kebiasaan belajar yang datang dari LMS atau sekolah.

Gamifikasi hanya memakai lima komponen: **Points, Level, Streak, Missions, Achievements**.

## Status

Tahap UI (frontend) selesai sebagai **demo**. Semua data adalah contoh dan tidak disimpan ke server.
Backend Laravel baru berisi fondasi (Sanctum, CORS, MySQL) dan belum dipakai oleh frontend.

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
- Backend: Laravel 13, Sanctum, MySQL (fondasi saja).
- Desain: Colorful Neobrutalism. Mendukung `prefers-reduced-motion`, navigasi keyboard, dan responsif.

## Struktur

```
frontend/src
├── components/   ui, layout, dashboard, tasks
├── pages/        halaman Student, auth/, admin/
├── context/      auth demo, pengumuman
├── hooks/        useAuth, useToast, useAnnouncements
└── lib/          navigasi, tanggal, data contoh
backend/          Laravel (fondasi)
```

## Deploy

GitHub Pages lewat `.github/workflows/deploy.yml` (frontend saja, base path `/GeezeStudy/`).
Aktifkan di Settings, Pages, Source: GitHub Actions.
