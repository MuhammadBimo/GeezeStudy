import {
  LayoutDashboard, ListChecks, CalendarDays, Timer, Target,
  Flag, TrendingUp, Users, Bell,
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
]
