import {
  Award, BellRing, CalendarDays, Flag, Home, Inbox, KeyRound, LifeBuoy, ListChecks, Megaphone, ScrollText,
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
      { to: '/notifikasi', label: 'Notifikasi', icon: BellRing, ring: true },
      { to: '/profil', label: 'Profil & Pengaturan', icon: UserRound },
      { to: '/bantuan', label: 'Bantuan', icon: LifeBuoy },
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
      // Grup yang bisa dibuka: Account Assistance adalah laporan kategori "lupa akun atau email" (filter lewat URL).
      {
        key: 'admin-helpdesk',
        label: 'Helpdesk',
        icon: LifeBuoy,
        children: [
          { key: 'admin-helpdesk-all', to: '/admin/helpdesk', excludeQuery: 'kategori=account_recovery', label: 'Semua laporan', icon: Inbox },
          { key: 'admin-helpdesk-recovery', to: '/admin/helpdesk?kategori=account_recovery', label: 'Account Assistance', icon: KeyRound },
        ],
      },
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


/** Item menu aktif menurut alamat sekarang; item bisa punya ?query (mis. filter kategori) atau mengecualikannya. */
export function isItemActive(item, pathname, search) {
  const [path, query] = item.to.split('?')
  const onPath = path === '/' || path === '/admin' ? pathname === path : pathname.startsWith(path)
  if (!onPath) return false
  if (query) return search.includes(query)
  return !(item.excludeQuery && search.includes(item.excludeQuery))
}

/** Daftar rata: item grup digantikan anak-anaknya (dipakai di menu mobile). */
export const flattenItems = (items) => items.flatMap((i) => i.children ?? [i])