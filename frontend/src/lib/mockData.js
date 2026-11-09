// DATA SEMENTARA (mock) — hanya untuk tampilan. Akan diganti dengan data dari API backend.
export const mockDashboard = {
  user: { name: 'Bimo' },
  level: 4,
  points: 340,
  nextLevelAt: 500,
  streak: 6,
  // Hari aktif minggu ini, urut Senin–Minggu.
  weekActive: [true, true, true, true, true, true, false],
  studyGoalMinutes: 90,
  // Menit belajar per hari, Senin–Minggu.
  weekStudyMinutes: [40, 65, 25, 90, 50, 45, 0],
  tasks: [
    { id: 1, title: 'Laporan Praktikum Basis Data', course: 'Basis Data', due: 'Hari ini, 23:59', priority: 'Tinggi', done: false },
    { id: 2, title: 'Rangkuman Bab 5', course: 'Jaringan Komputer', due: 'Besok', priority: 'Sedang', done: false },
    { id: 3, title: 'Latihan Soal Kalkulus', course: 'Kalkulus', due: 'Jumat', priority: 'Rendah', done: false },
    { id: 4, title: 'Baca jurnal UI/UX', course: 'Interaksi Manusia', due: 'Kemarin', priority: 'Rendah', done: true },
  ],
  agenda: [
    { id: 1, title: 'Kuliah Pemrograman Web', time: '13:00', type: 'Kuliah' },
    { id: 2, title: 'Presentasi Kelompok', time: '15:30', type: 'Presentasi' },
    { id: 3, title: 'Ujian Basis Data', time: 'Kamis, 08:00', type: 'Ujian' },
  ],
  missions: [
    { id: 1, title: 'Selesaikan 2 tugas', done: 1, total: 2, reward: 20 },
    { id: 2, title: 'Belajar 25 menit', done: 25, total: 25, reward: 15 },
    { id: 3, title: 'Capai target harian', done: 45, total: 90, reward: 30 },
  ],
  goals: [
    { id: 1, title: 'Belajar 10 jam minggu ini', done: 4.5, total: 10, unit: 'jam' },
    { id: 2, title: 'Selesaikan 8 tugas bulan ini', done: 5, total: 8, unit: 'tugas' },
  ],
  achievements: [
    { id: 1, title: 'Langkah Pertama', desc: 'Selesaikan tugas pertama', unlocked: true, icon: 'flag' },
    { id: 2, title: 'Api Menyala', desc: 'Streak 5 hari', unlocked: true, icon: 'flame' },
    { id: 3, title: 'Fokus Penuh', desc: 'Belajar 2 jam sehari', unlocked: false, icon: 'timer' },
  ],
}
