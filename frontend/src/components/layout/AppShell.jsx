import { Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Skeleton from '@/components/ui/Skeleton'
import { m } from 'motion/react'
import { GraduationCap, LogOut } from 'lucide-react'
import { navItems } from '@/lib/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

function SidebarLink({ to, label, icon: Icon, color }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-brutal border-2 px-3 py-2 font-bold transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none ${
          isActive
            ? `border-ink ${color} shadow-brutal-sm`
            : 'border-transparent hover:translate-x-1 hover:border-ink hover:bg-surface'
        }`
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

function BottomLink({ to, label, icon: Icon, color }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex min-w-18 shrink-0 flex-col items-center gap-0.5 rounded-brutal border-2 px-2 py-1 text-[11px] font-bold transition-all duration-150 active:scale-90 motion-reduce:transition-none ${
          isActive ? `border-ink ${color}` : 'border-transparent'
        }`
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

  const handleLogout = () => {
    logout()
    toast('Kamu sudah keluar')
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-brutal focus:bg-yellow focus:p-2"
      >
        Lewati ke konten
      </a>

      <aside className="hidden border-r-2 border-ink bg-pink-soft p-5 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-brutal border-2 border-ink bg-pink shadow-brutal-sm">
            <GraduationCap className="size-6" aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-extrabold">GeezeStudy</span>
        </div>
        <nav aria-label="Menu utama" className="flex flex-col gap-1.5">
          {navItems.map((item) => <SidebarLink key={item.to} {...item} />)}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t-2 border-ink pt-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-yellow font-display text-lg font-extrabold">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold leading-tight">{user.name}</p>
              <p className="truncate text-sm text-ink/70">{user.institution || 'Mode demo'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-brutal border-2 border-ink bg-surface px-3 py-2 font-bold shadow-brutal-sm transition-all hover:bg-pink active:translate-x-0.5 active:translate-y-0.5 active:shadow-none motion-reduce:transition-none"
          >
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-pink-soft px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6" aria-hidden="true" />
            <span className="font-display text-xl font-extrabold">GeezeStudy</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={`Keluar dari akun ${user.name}`}
            className="flex items-center gap-1.5 rounded-brutal border-2 border-ink bg-surface px-3 py-1 text-sm font-bold transition-transform active:scale-95"
          >
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </button>
        </div>

        <main id="konten" className="mx-auto max-w-5xl p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
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
        aria-label="Menu utama mobile"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t-2 border-ink bg-surface p-2 lg:hidden"
      >
        {navItems.map((item) => <BottomLink key={item.to} {...item} />)}
      </nav>
    </div>
  )
}
