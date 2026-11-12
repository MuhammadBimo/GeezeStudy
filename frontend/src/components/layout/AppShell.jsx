import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { m } from 'motion/react'
import { ArrowLeft, GraduationCap, LogOut, ShieldCheck } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { adminNavItems, navItems } from '@/lib/navigation'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/admin'}
      className={({ isActive }) =>
        cn(
          'group relative flex min-h-11 items-center gap-3 rounded-panel px-3 py-2 text-[0.95rem] font-medium transition-all duration-150 active:scale-[0.98] motion-reduce:transition-none',
          isActive
            ? 'bg-forest text-surface shadow-soft-sm'
            : 'text-ink/80 hover:bg-surface hover:text-ink hover:shadow-soft-sm',
        )
      }
    >
      <Icon className="size-[1.15rem] transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

function BottomLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/admin'}
      className={({ isActive }) =>
        cn(
          'flex min-h-12 min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-panel px-2 py-1 text-[11px] font-medium transition-all duration-150 active:scale-90 motion-reduce:transition-none',
          isActive ? 'bg-forest text-surface shadow-soft-sm' : 'text-ink/80',
        )
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

export default function AppShell() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const toast = useToast()

  const inAdmin = pathname.startsWith('/admin')
  const items = inAdmin ? adminNavItems : navItems
  const isAdmin = user.role === 'admin'

  const handleLogout = () => {
    logout()
    toast('Kamu sudah keluar')
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-panel focus:bg-forest focus:p-2 focus:text-surface"
      >
        Lewati ke konten
      </a>

      <aside
        className={cn(
          'hidden border-r border-line bg-canvas p-5 shadow-[6px_0_14px_-8px_rgb(122_98_52/0.3)] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-6 lg:overflow-y-auto',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-panel bg-forest text-surface shadow-soft-sm">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <span className="block font-display text-xl font-medium">GeezeStudy</span>
            {inAdmin && <span className="text-xs font-medium text-forest-mid">Panel Admin</span>}
          </div>
        </div>

        <nav aria-label={inAdmin ? 'Menu admin' : 'Menu utama'} className="flex flex-col gap-1.5">
          {items.map((item) => <SidebarLink key={item.to} {...item} />)}
        </nav>

        {isAdmin && (
          <Link
            to={inAdmin ? '/' : '/admin'}
            className="flex min-h-11 items-center gap-2 rounded-panel border border-line bg-surface px-3 py-2 text-sm font-semibold text-forest shadow-soft-sm transition-all hover:-translate-y-px active:shadow-inset motion-reduce:transition-none"
          >
            {inAdmin ? <ArrowLeft className="size-4" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
            {inAdmin ? 'Kembali ke aplikasi' : 'Panel Admin'}
          </Link>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-forest-tint font-display text-lg font-medium text-forest">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{user.name}</p>
              <p className="truncate text-sm text-ink/80">{isAdmin ? 'Admin (demo)' : user.institution || 'Mode demo'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center min-h-10 gap-2 rounded-panel border border-line bg-surface px-3 py-2 text-sm font-semibold shadow-soft-sm transition-all hover:bg-canvas active:shadow-inset motion-reduce:transition-none"
          >
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <div className={'flex items-center justify-between gap-2 border-b border-line bg-canvas px-4 py-3 lg:hidden'}>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-forest text-surface"><GraduationCap className="size-4" aria-hidden="true" /></span>
            <span className="font-display text-xl font-medium">{inAdmin ? 'Panel Admin' : 'GeezeStudy'}</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to={inAdmin ? '/' : '/admin'}
                aria-label={inAdmin ? 'Kembali ke aplikasi' : 'Buka Panel Admin'}
                className="grid size-10 place-items-center rounded-panel border border-line bg-surface shadow-soft-sm transition-transform active:scale-95"
              >
                {inAdmin ? <ArrowLeft className="size-4" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={`Keluar dari akun ${user.name}`}
              className="flex items-center gap-1.5 min-h-10 rounded-panel border border-line bg-surface px-3 py-1 text-sm font-semibold shadow-soft-sm transition-transform active:scale-95"
            >
              <LogOut className="size-4" aria-hidden="true" /> Keluar
            </button>
          </div>
        </div>

        <main id="konten" className="mx-auto max-w-6xl p-4 pb-28 sm:p-6 lg:px-10 lg:py-9">
          {/* Transisi singkat tiap pindah halaman: menjawab aksi pengguna (klik menu). */}
          <m.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Suspense
              fallback={
                <div role="status" aria-label="Memuat halaman" className="flex flex-col gap-4">
                  <Skeleton className="h-12 w-64" />
                  <Skeleton className="h-48 w-full" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </m.div>
        </main>
      </div>

      <nav
        aria-label={inAdmin ? 'Menu admin mobile' : 'Menu utama mobile'}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-canvas/95 p-2 backdrop-blur lg:hidden"
      >
        {items.map((item) => <BottomLink key={item.to} {...item} />)}
      </nav>
    </div>
  )
}
