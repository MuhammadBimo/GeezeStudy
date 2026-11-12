import {
  LayoutDashboard, ListChecks, CalendarDays, Timer, Target,
  Flag, TrendingUp, Users, Bell, Settings,
  ShieldCheck, UserCog, Trophy, Award, Megaphone, ScrollText,
} from 'lucide-react'

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-pink' },
  { to: '/tugas', label: 'Tugas', icon: ListChecks, color: 'bg-yellow' },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays, color: 'bg-sky' },
  { to: '/timer', label: 'Timer', icon: Timer, color: 'bg-mint' },
  { to: '/goals', label: 'Goals', icon: Target, color: 'bg-violet' },
  { to: '/misi', label: 'Misi', icon: Flag, color: 'bg-orange' },
  { to: '/progres', label: 'Progres', icon: TrendingUp, color: 'bg-mint' },
  { to: '/teman', label: 'Teman', icon: Users, color: 'bg-sky' },
  { to: '/notifikasi', label: 'Notifikasi', icon: Bell, color: 'bg-yellow' },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, color: 'bg-pink-soft' },
]

export const adminNavItems = [
  { to: '/admin', label: 'Ringkasan', icon: ShieldCheck, color: 'bg-yellow' },
  { to: '/admin/pengguna', label: 'Pengguna', icon: UserCog, color: 'bg-pink' },
  { to: '/admin/misi', label: 'Misi', icon: Flag, color: 'bg-orange' },
  { to: '/admin/points', label: 'Points & Level', icon: Trophy, color: 'bg-mint' },
  { to: '/admin/achievements', label: 'Achievements', icon: Award, color: 'bg-violet' },
  { to: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone, color: 'bg-yellow' },
  { to: '/admin/log', label: 'Log', icon: ScrollText, color: 'bg-surface' },
]
