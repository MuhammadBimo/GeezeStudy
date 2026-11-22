import { Award, CalendarClock, Clock, Flag, Flame, Info, LifeBuoy, Users } from 'lucide-react'

// Identitas visual tiap jenis aktivitas: ikon, warna lingkaran ikon, dan label singkat.
// `special` = diberi perlakuan lebih istimewa (achievement).
export const notificationMeta = {
  achievement: { label: 'Achievement', icon: Award, tint: 'bg-sand text-sand-ink', special: true },
  mission: { label: 'Misi', icon: Flag, tint: 'bg-sage text-accent' },
  streak: { label: 'Streak', icon: Flame, tint: 'bg-warning-soft text-warning' },
  deadline: { label: 'Tenggat', icon: Clock, tint: 'bg-danger-soft text-danger' },
  schedule: { label: 'Jadwal', icon: CalendarClock, tint: 'bg-info-soft text-info' },
  social: { label: 'Sosial', icon: Users, tint: 'bg-sage text-accent' },
  support: { label: 'Bantuan', icon: LifeBuoy, tint: 'bg-info-soft text-info' },
  system: { label: 'Sistem', icon: Info, tint: 'bg-ink/[0.06] text-ink-2' },
}

// Kategori yang bisa dimatikan di Preferensi (Bantuan selalu dikirim karena menyangkut laporanmu).
export const preferenceKeys = ['deadline', 'schedule', 'mission', 'streak', 'social', 'achievement', 'system']

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** Kelompokkan notifikasi menurut waktu: Hari ini, Kemarin, Sebelumnya (urutan tetap terbaru dulu). */
export function groupByDay(items, now = new Date()) {
  const today = startOfDay(now)
  const yesterday = today - 86_400_000
  const groups = [
    { key: 'today', label: 'Hari ini', items: [] },
    { key: 'yesterday', label: 'Kemarin', items: [] },
    { key: 'earlier', label: 'Sebelumnya', items: [] },
  ]
  for (const n of items) {
    const day = startOfDay(new Date(n.created_at))
    groups[day >= today ? 0 : day >= yesterday ? 1 : 2].items.push(n)
  }
  return groups.filter((g) => g.items.length > 0)
}
