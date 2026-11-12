// Menurunkan nama tampilan dari isian bebas, mis. "bimo.krisyono@gmail.com" -> "Bimo Krisyono".
export function nameFromEmail(value) {
  const local = value.trim().split('@')[0]
  const words = local.split(/[._\-\s]+/).filter(Boolean)
  if (words.length === 0) return 'Teman'
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const educationLevels = [
  { value: 'sd', label: 'SD' },
  { value: 'smp', label: 'SMP' },
  { value: 'sma', label: 'SMA / SMK' },
  { value: 'college', label: 'Mahasiswa' },
]

// Profil demo lengkap dengan nilai bawaan. Hanya Student dan Admin yang dikenal.
export function makeProfile(partial = {}) {
  return {
    name: 'Teman',
    username: '',
    email: '',
    role: 'student',
    level: 'college',
    institution: '',
    dailyGoal: 90,
    privacy: 'friends',
    calendarSync: false,
    emailVerified: true,
    onboarded: true,
    ...partial,
  }
}
