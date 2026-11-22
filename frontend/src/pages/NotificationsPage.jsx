import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { CheckCheck, Megaphone } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import TimePicker from '@/components/ui/TimePicker'
import Toggle from '@/components/ui/Toggle'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { refreshBadges } from '@/lib/badges'
import { cn } from '@/lib/cn'
import { clockTime, dayTime } from '@/lib/mappers'
import { groupByDay, notificationMeta, preferenceKeys } from '@/lib/notifications'

const categories = [{ value: 'all', label: 'Semua' }, ...Object.entries(notificationMeta).map(([value, meta]) => ({ value, label: meta.label }))]
const ease = [0.22, 0.8, 0.28, 1]

function Preferences() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const prefs = user.notification_prefs ?? {}
  const quiet = user.quiet_hours
  const [draft, setDraft] = useState(quiet ?? { from: '22:00', to: '06:00' })

  const save = async (patch, success) => {
    try {
      await updateProfile(patch)
      if (success) toast(success)
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }
  const saveHours = (next) => {
    setDraft(next)
    if (next.from && next.to) save({ quiet_hours: next })
  }

  return (
    <aside aria-labelledby="pref-title" className="h-fit rounded-panel border border-line bg-surface p-5">
      <h2 id="pref-title" className="font-semibold">Preferensi</h2>
      <p className="mt-0.5 text-sm text-ink-2">Pilih aktivitas yang ingin kamu ketahui.</p>
      <ul className="mt-4 divide-y divide-line">
        {preferenceKeys.map((key) => {
          const meta = notificationMeta[key]
          return (
            <li key={key} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2.5 text-sm"><meta.icon className="size-4 text-muted" aria-hidden="true" />{meta.label}</span>
              <Toggle label={`Notifikasi ${meta.label}`} checked={prefs[key] !== false} onChange={(v) => save({ notification_prefs: { ...prefs, [key]: v } })} />
            </li>
          )
        })}
      </ul>
      <div className="mt-3 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Jam tenang</h3>
            <p className="text-xs text-ink-2">Notifikasi dibisukan pada jam ini.</p>
          </div>
          <Toggle label="Jam tenang" checked={Boolean(quiet)} onChange={(v) => save({ quiet_hours: v ? draft : null }, v ? 'Jam tenang aktif' : 'Jam tenang dimatikan')} />
        </div>
        {quiet && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <TimePicker label="Mulai" value={draft.from} onChange={(e) => saveHours({ ...draft, from: e.target.value })} />
            <TimePicker label="Selesai" value={draft.to} onChange={(e) => saveHours({ ...draft, to: e.target.value })} />
          </div>
        )}
      </div>
    </aside>
  )
}

// Teks dari server dipecah menjadi label kecil (eyebrow), judul, dan angka utama, agar tiap jenis punya hierarki sendiri.
function present(n) {
  const strip = (prefix) => (n.title.startsWith(prefix) ? n.title.slice(prefix.length) : n.title)
  if (n.category === 'achievement') return { eyebrow: 'Achievement baru', title: strip('Achievement terbuka: '), body: n.body, featured: true }
  if (n.category === 'mission') return { eyebrow: 'Misi selesai', title: strip('Misi selesai: '), body: n.body }
  if (n.category === 'streak') {
    const days = Number(n.title.match(/(\d+)/)?.[1])
    if (days) return { eyebrow: 'Streak', title: `Belajar ${days} hari berturut-turut`, body: 'Pertahankan ritmenya, sedikit setiap hari sudah cukup.', stat: { value: days, unit: 'hari', tone: 'text-warning' } }
  }
  return { title: n.title, body: n.body }
}

const cardTone = {
  achievement: 'border-sand bg-sand-soft',
  streak: 'border-warning/25 bg-warning-soft/45',
}

function NotificationItem({ n, index, timeLabel, onOpen }) {
  const meta = notificationMeta[n.category] ?? notificationMeta.system
  const unread = n.read_at === null
  const view = present(n)
  const stat = n.points > 0 ? { value: `+${n.points}`, unit: 'Points', tone: n.category === 'achievement' ? 'text-sand-ink' : 'text-accent' } : view.stat

  return (
    <m.li
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease, delay: Math.min(index, 8) * 0.045 }}
      className="relative flex gap-3.5 pb-3 last:pb-0 sm:gap-4"
    >
      {/* Simpul di garis waktu. Cincin warna latar memotong garis agar simpul terlihat "menempel". */}
      <span className={cn(
        'relative z-[1] mt-3 grid shrink-0 place-items-center rounded-full ring-4 ring-canvas transition-transform duration-300',
        view.featured ? 'size-11 shadow-raised' : 'size-10',
        meta.tint,
      )}>
        <meta.icon className={view.featured ? 'size-5' : 'size-[1.125rem]'} aria-hidden="true" />
      </span>

      <button
        type="button"
        onClick={() => onOpen(n)}
        className={cn(
          'group min-w-0 flex-1 rounded-2xl border px-4 py-3.5 text-left transition-[transform,box-shadow,background-color,opacity] duration-300 sm:px-5 sm:py-4',
          'hover:-translate-y-0.5 hover:shadow-soft-sm active:translate-y-0 active:scale-[0.995] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100',
          cardTone[n.category] ?? 'border-line bg-surface',
          unread ? 'shadow-xs' : 'opacity-[0.86] hover:opacity-100',
          view.featured && unread && 'notif-sheen',
        )}
      >
        <span className="flex items-start gap-4">
          <span className="min-w-0 flex-1">
            {view.eyebrow && <span className={cn('mb-0.5 block text-xs font-semibold', n.category === 'achievement' ? 'text-sand-ink' : n.category === 'streak' ? 'text-warning' : 'text-accent')}>{view.eyebrow}</span>}
            <span className={cn(
              'block leading-snug',
              view.featured ? 'font-display text-[1.25rem] font-medium tracking-tight sm:text-[1.375rem]' : 'text-[0.9375rem]',
              unread ? (view.featured ? 'text-ink' : 'font-semibold text-ink') : (view.featured ? 'text-ink-2' : 'font-medium text-ink-2'),
            )}>{view.title}</span>
            {view.body && <span className={cn('mt-1 block text-sm leading-relaxed', unread ? 'text-ink-2' : 'text-muted')}>{view.body}</span>}
            <span className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <time dateTime={n.created_at} className="tabular-nums">{timeLabel(n.created_at)}</time>
              <span aria-hidden="true">·</span>
              <span>{meta.label}</span>
            </span>
          </span>

          {/* Angka utama: Points yang didapat atau panjang streak, ditampilkan besar. */}
          {stat && (
            <span className="shrink-0 text-right">
              <span className={cn('block font-display text-[1.875rem] leading-none tabular-nums sm:text-[2.125rem]', stat.tone)}>{stat.value}</span>
              <span className="mt-1 block text-xs font-medium text-ink-2">{stat.unit}</span>
            </span>
          )}

          <AnimatePresence initial={false}>
            {unread && (
              <m.span
                key="dot"
                aria-hidden="true"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease }}
                className="mt-1.5 size-2 shrink-0 rounded-full bg-forest"
              />
            )}
          </AnimatePresence>
        </span>
        {unread && <span className="sr-only">(belum dibaca)</span>}
      </button>
    </m.li>
  )
}

// Ringkasan editorial di atas daftar: hasil aktivitas hari ini dengan angka besar.
function TodaySummary({ items, unread }) {
  const { user } = useAuth()
  const today = groupByDay(items).find((g) => g.key === 'today')?.items ?? []
  const pointsToday = today.reduce((sum, n) => sum + (n.points ?? 0), 0)
  const unlockedToday = today.filter((n) => n.category === 'achievement').length
  const stats = [
    { label: 'Points didapat', value: `+${pointsToday}` },
    { label: 'Streak', value: user.streak, unit: 'hari' },
    { label: unlockedToday ? 'Achievement' : 'Belum dibaca', value: unlockedToday || unread },
  ]

  return (
    <m.section
      aria-label="Ringkasan hari ini"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="mb-7 rounded-panel bg-panel px-5 py-5 text-on-panel shadow-soft sm:px-7 sm:py-6"
    >
      <p className="text-sm text-on-panel/70">Ringkasan hari ini</p>
      <dl className="mt-3 grid grid-cols-3 gap-3 sm:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="truncate text-xs text-on-panel/70 sm:text-sm">{s.label}</dt>
            <dd className="mt-1 font-display text-[1.75rem] leading-none tabular-nums sm:text-[2.5rem]">
              {s.value}{s.unit && <span className="ml-1 font-sans text-sm text-on-panel/70 sm:text-base">{s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </m.section>
  )
}

function NotificationList({ resource, data, category }) {
  const toast = useToast()
  const items = data.notifications.data

  const markRead = async (n) => {
    if (n.read_at) return
    resource.mutate((d) => ({ ...d, unread: Math.max(0, d.unread - 1), notifications: { ...d.notifications, data: d.notifications.data.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) } }))
    try {
      await api.patch(`/notifications/${n.id}/read`)
      refreshBadges()
    } catch (error) {
      toast(errorMessage(error), 'error')
      resource.reload()
    }
  }

  if (items.length === 0) {
    const label = notificationMeta[category]?.label
    return (
      <div className="rounded-panel border border-line bg-surface">
        <EmptyState
          illustration="inbox"
          title={label ? `Belum ada notifikasi ${label}` : 'Belum ada notifikasi'}
          description="Misi yang selesai, achievement baru, streak, dan pengingat tugasmu akan muncul di sini."
          action={<Link to="/misi" className="inline-flex h-11 items-center rounded-control bg-raised px-4.5 font-semibold shadow-raised transition-colors hover:bg-surface-hover">Lihat misi hari ini</Link>}
        />
      </div>
    )
  }

  let index = 0
  return (
    <>
      {category === 'all' && <TodaySummary items={items} unread={data.unread} />}
      <div className="flex flex-col gap-8">
        {groupByDay(items).map((g) => (
          <section key={g.key} aria-labelledby={`group-${g.key}`}>
            <h2 id={`group-${g.key}`} className="mb-3 flex items-baseline gap-2 font-display text-[1.25rem] font-medium tracking-tight">
              {g.label} <span className="font-sans text-sm font-normal text-muted">{g.items.length}</span>
            </h2>
            <ol className="relative">
              {/* Garis waktu vertikal melewati tengah simpul ikon. */}
              <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-px bg-line" />
              {g.items.map((n) => (
                <NotificationItem key={n.id} n={n} index={index++} onOpen={markRead} timeLabel={g.key === 'earlier' ? dayTime : clockTime} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  )
}

export default function NotificationsPage() {
  const toast = useToast()
  const [cat, setCat] = useState('all')
  const resource = useResource('/notifications', cat === 'all' ? {} : { category: cat })
  const unread = resource.data?.unread ?? 0

  const markAll = async () => {
    try {
      await api.post('/notifications/read-all')
      refreshBadges()
      toast('Semua notifikasi ditandai dibaca')
      resource.reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Notifikasi"
        subtitle={unread > 0 ? `${unread} aktivitas belum dibaca.` : 'Semua aktivitas sudah dibaca.'}
        action={(
          <>
            <Link to="/pengumuman" aria-label="Pengumuman" className="inline-flex h-11 items-center gap-2 rounded-control px-3 text-[0.9375rem] font-semibold text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink sm:px-3.5">
              <Megaphone className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Pengumuman</span>
            </Link>
            <Button variant="secondary" onClick={markAll} disabled={unread === 0}>
              <CheckCheck aria-hidden="true" /> <span className="sm:hidden">Tandai dibaca</span><span className="hidden sm:inline">Tandai semua dibaca</span>
            </Button>
          </>
        )}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="thin-scroll -mx-1 mb-5 overflow-x-auto px-1 pb-1">
            <SegmentedControl label="Jenis aktivitas" options={categories} value={cat} onChange={setCat} size="sm" className="flex-nowrap" />
          </div>
          <AsyncView resource={resource}>{(data) => <NotificationList resource={resource} data={data} category={cat} />}</AsyncView>
        </div>
        <Preferences />
      </div>
    </>
  )
}
