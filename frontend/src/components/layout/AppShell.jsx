import { Suspense, useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, BellRing, ChevronDown, LayoutGrid, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Menu from '@/components/ui/Menu'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { adminMobilePrimary, adminNavGroups, flattenItems, isItemActive, mobilePrimary, navGroups } from '@/lib/navigation'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useNavBadges } from '@/hooks/useNavBadges'
import { useToast } from '@/hooks/useToast'

function Brand({ admin }) {
  return (
    <Link to={admin ? '/admin' : '/'} className="flex items-center gap-2.5 rounded-lg">
      {/* Lambang GeezeStudy (bagian perisai "G" dari logo splash). */}
      <img src={`${import.meta.env.BASE_URL}brand-mark.png`} alt="" width="40" height="40" className="size-10 shrink-0 object-contain" />
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

// Ikon menu yang memantul kecil saat diklik: mengecil sesaat, lalu sedikit membesar dan miring, kembali diam.
// `taps` dinaikkan oleh pemanggil setiap kali diklik; key baru memutar ulang animasinya.
function TapIcon({ icon: Icon, taps = 0, className }) {
  return (
    <m.span
      key={taps}
      className="grid place-items-center"
      initial={false}
      animate={taps > 0 ? { scale: [1, 0.8, 1.14, 1], rotate: [0, -8, 5, 0] } : undefined}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Icon className={className} aria-hidden="true" />
    </m.span>
  )
}

// Lonceng notifikasi: bergoyang singkat saat diklik (`taps`) atau saat jumlah belum dibaca bertambah.
// Titik kecil di pojok menandai ada yang belum dibaca; cincinnya mengikuti warna latar di belakangnya.
function RingingBell({ count = 0, taps = 0, className, ringClass = 'ring-rail' }) {
  const [seen, setSeen] = useState(count)
  const [arrivals, setArrivals] = useState(0)
  if (count !== seen) {
    setSeen(count)
    if (count > seen) setArrivals((a) => a + 1)
  }

  return (
    <span className="relative inline-grid place-items-center">
      <m.span
        key={`${taps}-${arrivals}`}
        className="grid place-items-center"
        style={{ transformOrigin: '50% 12%' }}
        initial={false}
        animate={taps + arrivals > 0 ? { rotate: [0, -16, 13, -9, 5, -2, 0] } : undefined}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <BellRing className={className} strokeWidth={1.85} aria-hidden="true" />
      </m.span>
      <AnimatePresence>
        {count > 0 && (
          <m.span
            key="dot"
            aria-hidden="true"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
            className={cn('absolute -right-0.5 -top-0.5 size-2 rounded-full bg-danger ring-2', ringClass)}
          />
        )}
      </AnimatePresence>
    </span>
  )
}

function SideLink({ to, label, icon: Icon, active, count, child = false, ring = false }) {
  const [taps, setTaps] = useState(0)
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      onClick={() => setTaps((t) => t + 1)}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 text-[0.9375rem] transition-colors duration-150',
        child ? 'h-9 text-sm' : 'h-10',
        active ? 'font-semibold text-accent' : 'text-ink-2 hover:bg-ink/[0.04] hover:text-ink',
      )}
    >
      {active && (
        <m.span layoutId="side-active" transition={{ type: 'spring', stiffness: 500, damping: 40 }} className="absolute inset-0 rounded-lg bg-sage">
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-forest" />
        </m.span>
      )}
      {ring ? (
        <span className="relative shrink-0 transition-transform duration-150 group-hover:scale-105">
          <RingingBell count={count} taps={taps} className="size-[1.125rem]" ringClass={active ? 'ring-sage' : 'ring-rail'} />
        </span>
      ) : Icon && (
        <span className="relative shrink-0 transition-transform duration-150 group-hover:scale-105">
          <TapIcon icon={Icon} taps={taps} className="size-[1.125rem]" />
        </span>
      )}
      <span className="relative min-w-0 flex-1 truncate">{label}</span>
      <Badge count={count} className="relative" />
    </Link>
  )
}

// Grup menu yang bisa dibuka (accordion). Tinggi panel menyesuaikan isinya, jadi menu di bawahnya ikut bergeser, tidak tertimpa.
function SideGroup({ item, open, onToggle, isActive, badges }) {
  const panelId = useId()
  const [taps, setTaps] = useState(0)
  const Icon = item.icon
  const anyActive = item.children.some(isActive)

  return (
    <div>
      <button
        type="button"
        onClick={() => { setTaps((t) => t + 1); onToggle() }}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'group relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.9375rem] transition-colors duration-150',
          anyActive ? 'font-semibold text-accent' : 'text-ink-2 hover:bg-ink/[0.04] hover:text-ink',
        )}
      >
        <span className="shrink-0 transition-transform duration-150 group-hover:scale-105">
          <TapIcon icon={Icon} taps={taps} className="size-[1.125rem]" />
        </span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {!open && <Badge count={badges[item.key]} />}
        <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.8, 0.28, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-[1.35rem] mt-0.5 flex flex-col gap-0.5 border-l border-line pb-1 pl-2">
              {item.children.map((c) => <SideLink key={c.key} to={c.to} label={c.label} child active={isActive(c)} count={badges[c.key]} />)}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BottomNavItem({ item, active, dot }) {
  const { to, label, short, icon } = item
  const [taps, setTaps] = useState(0)
  return (
    <NavLink to={to} end={to === '/' || to === '/admin'} onClick={() => setTaps((t) => t + 1)} className={cn('relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium transition-colors', active ? 'text-accent' : 'text-ink-2')}>
      {active && <m.span layoutId="bottom-active" className="absolute top-1 h-8 w-12 rounded-full bg-sage" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
      <span className="relative">
        <TapIcon icon={icon} taps={taps} className="size-5" />
        {dot && <span aria-hidden="true" className="absolute -right-1 -top-0.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />}
      </span>
      <span className="relative">{short ?? label}</span>
    </NavLink>
  )
}

export default function AppShell() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [moreOpen, setMoreOpen] = useState(false)
  const [bellTaps, setBellTaps] = useState(0)
  const [moreTaps, setMoreTaps] = useState(0)
  const { badges, loaded } = useNavBadges(user.role === 'admin')

  // Pop-up saat ada pembaruan Helpdesk baru ketika aplikasi sedang dibuka (angka awal tidak dihitung).
  const helpdeskCount = (user.role === 'admin' ? badges['admin-helpdesk'] : badges['/bantuan']) ?? 0
  const lastHelpdesk = useRef(null)
  useEffect(() => {
    if (!loaded) return
    if (lastHelpdesk.current !== null && helpdeskCount > lastHelpdesk.current) {
      toast(user.role === 'admin' ? 'Ada laporan baru yang menunggu' : 'Ada pembaruan baru pada laporanmu di Bantuan', 'info')
    }
    lastHelpdesk.current = helpdeskCount
  }, [loaded, helpdeskCount, user.role, toast])

  const inAdmin = pathname.startsWith('/admin')
  const groups = inAdmin ? adminNavGroups : navGroups
  const allItems = groups.flatMap((g) => flattenItems(g.items))
  const primaryTo = inAdmin ? adminMobilePrimary : mobilePrimary
  const isActive = (item) => isItemActive(item, pathname, search)
  const hiddenBadge = allItems.some((i) => !primaryTo.includes(i.to) && badges[i.key ?? i.to] > 0)

  // Accordion: satu grup terbuka. Terbuka otomatis bila salah satu anaknya sedang aktif; klik pengguna menimpanya hanya di halaman itu.
  const [manual, setManual] = useState({ path: null, key: null })
  const override = manual.path === pathname ? manual.key : null
  const isOpen = (item) => (override === null ? item.children.some(isActive) : override === item.key)
  const toggleGroup = (item) => setManual({ path: pathname, key: isOpen(item) ? '' : item.key })
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
    ...(inAdmin ? [] : [{ label: 'Profil & Pengaturan', icon: UserRound, onSelect: () => navigate('/profil') }]),
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
                {g.items.map((item) => (item.children
                  ? <SideGroup key={item.key} item={item} open={isOpen(item)} onToggle={() => toggleGroup(item)} isActive={isActive} badges={badges} />
                  : <SideLink key={item.to} {...item} active={isActive(item)} count={badges[item.to]} />))}
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
              <Link
                to="/notifikasi"
                aria-label="Notifikasi"
                aria-current={pathname === '/notifikasi' ? 'page' : undefined}
                onClick={() => setBellTaps((t) => t + 1)}
                className={cn('relative grid size-10 place-items-center rounded-lg transition-colors', pathname === '/notifikasi' ? 'bg-sage text-accent' : 'text-ink-2 hover:bg-ink/5 hover:text-ink')}
              >
                <RingingBell count={badges['/notifikasi']} taps={bellTaps} className="size-5" ringClass={pathname === '/notifikasi' ? 'ring-sage' : 'ring-rail'} />
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
        {primary.map((item) => <BottomNavItem key={item.to} item={item} active={isActive(item)} dot={badges[item.to] > 0} />)}
        <button
          type="button"
          onClick={() => { setMoreTaps((t) => t + 1); setMoreOpen(true) }}
          aria-haspopup="dialog"
          className={cn('flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium', !primary.some(isActive) ? 'text-accent' : 'text-ink-2')}
        >
          <span className="relative">
            <TapIcon icon={LayoutGrid} taps={moreTaps} className="size-5" />
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
                {flattenItems(g.items).map((item) => (
                  <Link
                    key={item.key ?? item.to}
                    to={item.to}
                    aria-current={isActive(item) ? 'page' : undefined}
                    onClick={() => setMoreOpen(false)}
                    className={cn('flex h-12 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-colors', isActive(item) ? 'border-sage-deep bg-sage text-accent' : 'border-line bg-surface hover:bg-hover')}
                  >
                    <item.icon className="size-4.5 shrink-0" aria-hidden="true" /> <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <Badge count={badges[item.key ?? item.to]} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </Modal>
    </div>
  )
}
