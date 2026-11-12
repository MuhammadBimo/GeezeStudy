import {
  LayoutDashboard, ListChecks, CalendarDays, Timer, Target,
  Flag, TrendingUp, Users, Bell, Settings,
  ShieldCheck, UserCog, Trophy, Award, Megaphone, ScrollText,
} from 'lucide-react'

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-sage' },
  { to: '/tugas', label: 'Tugas', icon: ListChecks, color: 'bg-sand-deep' },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays, color: 'bg-mist' },
  { to: '/timer', label: 'Timer', icon: Timer, color: 'bg-moss' },
  { to: '/goals', label: 'Goals', icon: Target, color: 'bg-stone' },
  { to: '/misi', label: 'Misi', icon: Flag, color: 'bg-clay' },
  { to: '/progres', label: 'Progres', icon: TrendingUp, color: 'bg-moss' },
  { to: '/teman', label: 'Teman', icon: Users, color: 'bg-mist' },
  { to: '/notifikasi', label: 'Notifikasi', icon: Bell, color: 'bg-sand-deep' },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, color: 'bg-forest-tint' },
]

export const adminNavItems = [
  { to: '/admin', label: 'Ringkasan', icon: ShieldCheck, color: 'bg-sand-deep' },
  { to: '/admin/pengguna', label: 'Pengguna', icon: UserCog, color: 'bg-sage' },
  { to: '/admin/misi', label: 'Misi', icon: Flag, color: 'bg-clay' },
  { to: '/admin/points', label: 'Points & Level', icon: Trophy, color: 'bg-moss' },
  { to: '/admin/achievements', label: 'Achievements', icon: Award, color: 'bg-stone' },
  { to: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone, color: 'bg-sand-deep' },
  { to: '/admin/log', label: 'Log', icon: ScrollText, color: 'bg-surface' },
]
