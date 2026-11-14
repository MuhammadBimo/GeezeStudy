import {
  Award, Bell, CalendarDays, Flag, Home, ListChecks, Megaphone, ScrollText, Settings,
  ShieldCheck, Target, Timer, TrendingUp, Trophy, UserCog, UserRound, Users,
} from 'lucide-react'

// Menu Student dikelompokkan menurut tujuan; label grup memakai huruf kalimat biasa.
export const navGroups = [
  {
    label: 'Belajar',
    items: [
      { to: '/', label: 'Beranda', icon: Home },
      { to: '/tugas', label: 'Tugas', icon: ListChecks },
      { to: '/kalender', label: 'Kalender', icon: CalendarDays },
      { to: '/timer', label: 'Study Timer', short: 'Timer', icon: Timer },
    ],
  },
  {
    label: 'Perkembangan',
    items: [
      { to: '/goals', label: 'Goals', icon: Target },
      { to: '/misi', label: 'Misi', icon: Flag },
      { to: '/progres', label: 'Progres', icon: TrendingUp },
      { to: '/achievements', label: 'Achievements', icon: Award },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { to: '/teman', label: 'Teman', icon: Users },
      { to: '/notifikasi', label: 'Notifikasi', icon: Bell },
      { to: '/profil', label: 'Profil', icon: UserRound },
      { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
    ],
  },
]

export const adminNavGroups = [
  {
    label: 'Panel Admin',
    items: [
      { to: '/admin', label: 'Ringkasan', icon: ShieldCheck },
      { to: '/admin/pengguna', label: 'Pengguna', icon: UserCog },
      { to: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone },
      { to: '/admin/log', label: 'Log', icon: ScrollText },
    ],
  },
  {
    label: 'Gamifikasi',
    items: [
      { to: '/admin/misi', label: 'Misi', icon: Flag },
      { to: '/admin/points', label: 'Points & Level', icon: Trophy },
      { to: '/admin/achievements', label: 'Achievements', icon: Award },
    ],
  },
]

// Empat menu yang tampil langsung di bottom navigation mobile; sisanya ada di "Lainnya".
export const mobilePrimary = ['/', '/tugas', '/timer', '/kalender']
export const adminMobilePrimary = ['/admin', '/admin/pengguna', '/admin/misi', '/admin/pengumuman']
