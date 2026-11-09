import { Link, NavLink, Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { navItems } from '@/lib/navigation'

function SidebarLink({ to, label, icon: Icon, color }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-brutal border-2 px-3 py-2 font-bold transition-all ${
          isActive
            ? `border-ink ${color} shadow-brutal-sm`
            : 'border-transparent hover:border-ink hover:bg-surface'
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
        `flex min-w-18 shrink-0 flex-col items-center gap-0.5 rounded-brutal border-2 px-2 py-1 text-[11px] font-bold ${
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
        <div className="mt-auto flex flex-col gap-2 border-t-2 border-ink pt-4">
          <Link to="/masuk" className="rounded-brutal border-2 border-ink bg-surface px-3 py-2 text-center font-bold shadow-brutal-sm hover:bg-yellow">
            Masuk
          </Link>
          <Link to="/daftar" className="rounded-brutal border-2 border-ink bg-pink px-3 py-2 text-center font-bold shadow-brutal-sm">
            Daftar
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center gap-2 border-b-2 border-ink bg-pink-soft px-4 py-3 lg:hidden">
          <GraduationCap className="size-6" aria-hidden="true" />
          <span className="font-display text-xl font-extrabold">GeezeStudy</span>
        </div>
        <main id="konten" className="mx-auto max-w-5xl p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
          <Outlet />
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
