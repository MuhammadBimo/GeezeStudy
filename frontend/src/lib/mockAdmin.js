// DATA SEMENTARA (mock) untuk Panel Admin. Akan diganti dengan data dari API backend.
export const adminStats = {
  totalUsers: 1284,
  activeToday: 342,
  sessionsToday: 913,
  errors24h: 3,
}

// Pengguna baru per hari, 7 hari terakhir (Senin–Minggu).
export const newUsersWeek = [18, 25, 31, 22, 40, 36, 12]

export const initialUsers = [
  { id: 1, name: 'Dimas Saputra', email: 'dimas@contoh.id', role: 'Student', level: 'Mahasiswa', joined: '3 Okt 2026', status: 'active' },
  { id: 2, name: 'Ayu Putri', email: 'ayu@contoh.id', role: 'Student', level: 'SMA / SMK', joined: '8 Okt 2026', status: 'active' },
  { id: 3, name: 'Rafi Pratama', email: 'rafi@contoh.id', role: 'Student', level: 'Mahasiswa', joined: '12 Okt 2026', status: 'suspended' },
  { id: 4, name: 'Salsa Maharani', email: 'salsa@contoh.id', role: 'Student', level: 'SMP', joined: '19 Okt 2026', status: 'active' },
  { id: 5, name: 'Nadia Kusuma', email: 'nadia@contoh.id', role: 'Student', level: 'Mahasiswa', joined: '25 Okt 2026', status: 'active' },
  { id: 6, name: 'Admin Utama', email: 'admin@contoh.id', role: 'Admin', level: '-', joined: '1 Sep 2026', status: 'active' },
  { id: 7, name: 'Bagas Wicaksono', email: 'bagas@contoh.id', role: 'Student', level: 'SD', joined: '30 Okt 2026', status: 'active' },
]

export const initialMissionTemplates = [
  { id: 1, title: 'Selesaikan 2 tugas', period: 'daily', metric: 'tasks', target: 2, reward: 20, active: true },
  { id: 2, title: 'Belajar 25 menit', period: 'daily', metric: 'minutes', target: 25, reward: 15, active: true },
  { id: 3, title: 'Capai target belajar harian', period: 'daily', metric: 'goal', target: 1, reward: 30, active: true },
  { id: 4, title: 'Belajar 5 hari berbeda', period: 'weekly', metric: 'streak', target: 5, reward: 60, active: true },
  { id: 5, title: 'Selesaikan 8 tugas', period: 'weekly', metric: 'tasks', target: 8, reward: 80, active: false },
]

export const initialPointRules = [
  { id: 1, activity: 'Sesi belajar valid', unit: 'per 5 menit', points: 2, cap: 60 },
  { id: 2, activity: 'Tugas selesai', unit: 'per tugas', points: 20, cap: 100 },
  { id: 3, activity: 'Misi harian selesai', unit: 'per misi', points: 15, cap: 60 },
  { id: 4, activity: 'Target harian tercapai', unit: 'per hari', points: 30, cap: 30 },
]

export const initialLevels = [
  { level: 1, min: 0 },
  { level: 2, min: 100 },
  { level: 3, min: 250 },
  { level: 4, min: 500 },
  { level: 5, min: 900 },
  { level: 6, min: 1400 },
]

export const initialAchievements = [
  { id: 1, title: 'Langkah Pertama', desc: 'Selesaikan tugas pertama', condition: 'tasks', target: 1, bonus: 10, active: true },
  { id: 2, title: 'Api Menyala', desc: 'Streak 5 hari', condition: 'streak', target: 5, bonus: 50, active: true },
  { id: 3, title: 'Fokus Penuh', desc: 'Belajar 2 jam dalam sehari', condition: 'minutes', target: 120, bonus: 40, active: true },
  { id: 4, title: 'Seminggu Penuh', desc: 'Streak 7 hari', condition: 'streak', target: 7, bonus: 80, active: false },
]

export const adminActivity = [
  { id: 1, when: '10 menit lalu', actor: 'Admin Utama', action: 'Menangguhkan akun Rafi Pratama' },
  { id: 2, when: '1 jam lalu', actor: 'Admin Utama', action: 'Mengubah reward misi "Belajar 25 menit" menjadi 15 pts' },
  { id: 3, when: 'Kemarin', actor: 'Admin Utama', action: 'Membuat pengumuman "Selamat datang"' },
  { id: 4, when: '2 hari lalu', actor: 'Admin Utama', action: 'Menonaktifkan achievement "Seminggu Penuh"' },
]

export const errorLogs = [
  { id: 1, when: '12:04', level: 'error', message: 'Timeout saat sinkronisasi Google Calendar', source: 'calendar-sync' },
  { id: 2, when: '09:31', level: 'warning', message: 'Sesi belajar ditolak: durasi tidak valid', source: 'study-session' },
  { id: 3, when: 'Kemarin', level: 'error', message: 'Gagal mengirim email verifikasi', source: 'mailer' },
]

export const metricOptions = [
  { value: 'tasks', label: 'Jumlah tugas selesai' },
  { value: 'minutes', label: 'Menit belajar' },
  { value: 'streak', label: 'Hari streak' },
  { value: 'goal', label: 'Target harian tercapai' },
]
