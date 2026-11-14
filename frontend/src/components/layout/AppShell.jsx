import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { m } from 'motion/react'
import { ArrowLeft, Bell, GraduationCap, LayoutGrid, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Menu from '@/components/ui/Menu'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { adminMobilePrimary, adminNavGroups, mobilePrimary, navGroups } from '@/lib/navigation'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const isActivePath = (pathname, to) => (to === '/' || to === '/admin' ? pathname === to : pathname.startsWith(to))

function Brand({ admin }) {
  return (
    <Link to={admin ? '/admin' : '/'} className="flex items-center gap-2.5 rounded-lg">
      <span className="grid size-8 place-items-center rounded-[0.6rem] bg-forest text-sand">
        <GraduationCap className="size-4.5" aria-hidden="true" />
      </span>
      <span className="font-display text-[1.15rem] font-medium tracking-tight">GeezeStudy</span>
      {admin && <span className="rounded-md bg-sand px-1.5 py-0.5 text-[0.6875rem] font-semibold text-[#5b4a2a]">Admin</span>}
    </Link>
  )
}

function SideLink({ to, label, icon: Icon, active }) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/admin'}
      className={cn(
        'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] transition-colors duration-150',
        active ? 'font-semibold text-forest' : 'text-ink-2 hover:bg-ink/[0.04] hover:text-ink',
      )}
    >
      {active && (
        <m.span layoutId="side-active" transition={{ type: 'spring', stiffness: 500, damping: 40 }} className="absolute inset-0 rounded-lg bg-sage">
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-forest" />
        </m.span>
      )}
      <Icon className="relative size-[1.125rem] transition-transform duration-150 group-hover:scale-105" aria-hidden="true" />
      <span className="relative">{label}</span>
    </NavLink>
  )
}

export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [moreOpen, setMoreOpen] = useState(false)

  const inAdmin = pathname.startsWith('/admin')
  const groups = inAdmin ? adminNavGroups : navGroups
  const allItems = groups.flatMap((g) => g.items)
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
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-forest focus:px-3 focus:py-2 focus:text-surface">
        Lewati ke konten
      </a>

      {/* Sidebar desktop */}
      <aside className="hidden border-r border-line bg-canvas lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="px-5 pb-4 pt-6"><Brand admin={inAdmin} /></div>
        <nav aria-label={inAdmin ? 'Menu admin' : 'Menu utama'} className="thin-scroll flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((g) => (
            <div key={g.label} className="mt-4 first:mt-1">
              <p className="mb-1.5 px-3 text-xs font-medium text-muted">{g.label}</p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((item) => <SideLink key={item.to} {...item} active={isActivePath(pathname, item.to)} />)}
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-canvas/95 px-4 lg:hidden">
          <Brand admin={inAdmin} />
          <div className="flex items-center gap-1">
            {!inAdmin && (
              <Link to="/notifikasi" aria-label="Notifikasi" className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-ink/5 hover:text-ink">
                <Bell className="size-5" aria-hidden="true" />
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
            <NavLink key={to} to={to} end={to === '/' || to === '/admin'} className={cn('relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium transition-colors', active ? 'text-forest' : 'text-ink-2')}>
              {active && <m.span layoutId="bottom-active" className="absolute top-1 h-8 w-12 rounded-full bg-sage" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <Icon className="relative size-5" aria-hidden="true" />
              <span className="relative">{short ?? label}</span>
            </NavLink>
          )
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          className={cn('flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium', !primary.some((p) => isActivePath(pathname, p.to)) ? 'text-forest' : 'text-ink-2')}
        >
          <LayoutGrid className="size-5" aria-hidden="true" /> Lainnya
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
                    className={cn('flex h-12 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-colors', isActivePath(pathname, to) ? 'border-sage-deep bg-sage text-forest' : 'border-line bg-surface hover:bg-canvas')}
                  >
                    <Icon className="size-4.5" aria-hidden="true" /> {label}
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
