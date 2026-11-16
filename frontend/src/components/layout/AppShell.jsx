import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { m } from 'motion/react'
import { ArrowLeft, Bell, GraduationCap, LayoutGrid, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Menu from '@/components/ui/Menu'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { adminMobilePrimary, adminNavGroups, mobilePrimary, navGroups } from '@/lib/navigation'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useNavBadges } from '@/hooks/useNavBadges'
import { useToast } from '@/hooks/useToast'

const isActivePath = (pathname, to) => (to === '/' || to === '/admin' ? pathname === to : pathname.startsWith(to))

function Brand({ admin }) {
  return (
    <Link to={admin ? '/admin' : '/'} className="flex items-center gap-2.5 rounded-lg">
      <span className="grid size-8 place-items-center rounded-[0.6rem] bg-panel text-[#e8dcc4]">
        <GraduationCap className="size-4.5" aria-hidden="true" />
      </span>
      <span className="font-display text-[1.15rem] font-medium tracking-tight">GeezeStudy</span>
      {admin && <span className="rounded-md bg-sand px-1.5 py-0.5 text-[0.6875rem] font-semibold text-sand-ink">Admin</span>}
    </Link>
  )
}

// Lencana: angka merah kecil; tampil hanya bila ada yang belum dibuka.
function Badge({ count, className }) {
  if (!count) return null
  return (
    <span className={cn('grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-danger px-1 text-[0.6875rem] font-semibold leading-none text-on-danger', className)}>
      <span aria-hidden="true">{count > 99 ? '99+' : count}</span>
      <span className="sr-only">{count} belum dibuka</span>
    </span>
  )
}

function SideLink({ to, label, icon: Icon, active, count }) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/admin'}
      className={cn(
        'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] transition-colors duration-150',
        active ? 'font-semibold text-accent' : 'text-ink-2 hover:bg-ink/[0.04] hover:text-ink',
      )}
    >
      {active && (
        <m.span layoutId="side-active" transition={{ type: 'spring', stiffness: 500, damping: 40 }} className="absolute inset-0 rounded-lg bg-sage">
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-forest" />
        </m.span>
      )}
      <Icon className="relative size-[1.125rem] transition-transform duration-150 group-hover:scale-105" aria-hidden="true" />
      <span className="relative min-w-0 flex-1">{label}</span>
      <Badge count={count} className="relative" />
    </NavLink>
  )
}

export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [moreOpen, setMoreOpen] = useState(false)
  const badges = useNavBadges(user.role === 'admin')

  const inAdmin = pathname.startsWith('/admin')
  const groups = inAdmin ? adminNavGroups : navGroups
  const allItems = groups.flatMap((g) => g.items)
  const primaryTo = inAdmin ? adminMobilePrimary : mobilePrimary
  const hiddenBadge = allItems.some((i) => !primaryTo.includes(i.to) && badges[i.to] > 0)
  const primary = (inAdmin ? adminMobilePrimary : mobilePrimary).map((to) => allItems.find((i) => i.to === to))
  const isAdmin = user.role === 'admin'

  const handleLogout = async () => {
    try {
      await logout()
      toast.info('Kamu sudah keluar')
    } catch {
      toast('Gagal keluar. Coba lagi.', 'error')
    }
  }

  const accountMenu = [
    ...(inAdmin ? [] : [{ label: 'Profil', icon: UserRound, onSelect: () => navigate('/profil') }, { label: 'Pengaturan', icon: Settings, onSelect: () => navigate('/pengaturan') }]),
    ...(isAdmin ? [{ label: inAdmin ? 'Kembali ke aplikasi' : 'Panel Admin', icon: inAdmin ? ArrowLeft : ShieldCheck, onSelect: () => navigate(inAdmin ? '/' : '/admin') }] : []),
    '-',
    { label: 'Keluar', icon: LogOut, danger: true, onSelect: handleLogout },
  ]

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_1fr]">
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-forest focus:px-3 focus:py-2 focus:text-on-forest">
        Lewati ke konten
      </a>

      {/* Sidebar desktop */}
      <aside className="hidden border-r border-line bg-rail lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between px-5 pb-4 pt-6"><Brand admin={inAdmin} /><ThemeToggle /></div>
        <nav aria-label={inAdmin ? 'Menu admin' : 'Menu utama'} className="thin-scroll flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((g) => (
            <div key={g.label} className="mt-4 first:mt-1">
              <p className="mb-1.5 px-3 text-xs font-medium text-muted">{g.label}</p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((item) => <SideLink key={item.to} {...item} active={isActivePath(pathname, item.to)} count={badges[item.to]} />)}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-line px-4 py-4">
          <Link to={inAdmin ? '/admin' : '/profil'} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg">
            <Avatar name={user.name} src={user.avatar_url} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-ink-2">{isAdmin ? 'Admin' : user.institution || 'Student'}</span>
            </span>
          </Link>
          <Menu items={accountMenu} label="Menu akun" />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Bar atas mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-rail/95 px-4 lg:hidden">
          <Brand admin={inAdmin} />
          <div className="flex items-center gap-1">
            <ThemeToggle className="size-10" />
            {!inAdmin && (
              <Link to="/notifikasi" aria-label="Notifikasi" className="relative grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-ink/5 hover:text-ink">
                <Bell className="size-5" aria-hidden="true" />
                {badges['/notifikasi'] > 0 && <span aria-hidden="true" className="absolute right-2 top-2 size-2.5 rounded-full bg-danger ring-2 ring-rail" />}
              </Link>
            )}
            <Menu items={accountMenu} label="Menu akun" className="size-10"><Avatar name={user.name} src={user.avatar_url} size="xs" /></Menu>
          </div>
        </header>

        <main id="konten" className="mx-auto w-full max-w-[72rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <m.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            <Suspense
              fallback={
                <div role="status" aria-label="Memuat halaman" className="flex flex-col gap-4">
                  <Skeleton className="h-10 w-56" />
                  <Skeleton className="h-40 w-full rounded-panel" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </m.div>
        </main>
      </div>

      {/* Bottom navigation mobile */}
      <nav
        aria-label={inAdmin ? 'Menu admin mobile' : 'Menu utama mobile'}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/97 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 lg:hidden"
      >
        {primary.map(({ to, label, short, icon: Icon }) => {
          const active = isActivePath(pathname, to)
          return (
            <NavLink key={to} to={to} end={to === '/' || to === '/admin'} className={cn('relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium transition-colors', active ? 'text-accent' : 'text-ink-2')}>
              {active && <m.span layoutId="bottom-active" className="absolute top-1 h-8 w-12 rounded-full bg-sage" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className="relative">
                <Icon className="size-5" aria-hidden="true" />
                {badges[to] > 0 && <span aria-hidden="true" className="absolute -right-1 -top-0.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />}
              </span>
              <span className="relative">{short ?? label}</span>
            </NavLink>
          )
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          className={cn('flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium', !primary.some((p) => isActivePath(pathname, p.to)) ? 'text-accent' : 'text-ink-2')}
        >
          <span className="relative">
            <LayoutGrid className="size-5" aria-hidden="true" />
            {hiddenBadge && <span aria-hidden="true" className="absolute -right-1 -top-0.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />}
          </span>
          Lainnya
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Semua menu" size="sm">
        <nav aria-label="Semua menu" className="flex flex-col gap-5">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-xs font-medium text-muted">{g.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {g.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/' || to === '/admin'}
                    onClick={() => setMoreOpen(false)}
                    className={cn('flex h-12 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-colors', isActivePath(pathname, to) ? 'border-sage-deep bg-sage text-accent' : 'border-line bg-surface hover:bg-hover')}
                  >
                    <Icon className="size-4.5" aria-hidden="true" /> <span className="min-w-0 flex-1 truncate">{label}</span>
                    <Badge count={badges[to]} />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </Modal>
    </div>
  )
}
