import { useState } from 'react'
import { Award, CalendarClock, CheckCheck, Clock, Flag, Info, Users } from 'lucide-react'
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
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/mappers'

const catMeta = {
  deadline: { label: 'Tenggat', icon: Clock, tint: 'bg-danger-soft text-danger' },
  schedule: { label: 'Jadwal', icon: CalendarClock, tint: 'bg-info-soft text-info' },
  mission: { label: 'Misi', icon: Flag, tint: 'bg-sage text-forest' },
  social: { label: 'Sosial', icon: Users, tint: 'bg-sage text-forest' },
  achievement: { label: 'Achievements', icon: Award, tint: 'bg-sand text-[#6b5326]' },
  system: { label: 'Sistem', icon: Info, tint: 'bg-ink/[0.06] text-ink-2' },
}
const categories = [{ value: 'all', label: 'Semua' }, ...Object.entries(catMeta).map(([value, m]) => ({ value, label: m.label }))]

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
      <p className="mt-0.5 text-sm text-ink-2">Pilih notifikasi yang ingin kamu terima.</p>
      <ul className="mt-4 divide-y divide-line">
        {Object.entries(catMeta).map(([key, meta]) => (
          <li key={key} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex items-center gap-2.5 text-sm"><meta.icon className="size-4 text-muted" aria-hidden="true" />{meta.label}</span>
            <Toggle label={`Notifikasi ${meta.label}`} checked={prefs[key] !== false} onChange={(v) => save({ notification_prefs: { ...prefs, [key]: v } })} />
          </li>
        ))}
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

function NotificationList({ resource, data }) {
  const toast = useToast()
  const items = data.notifications.data

  const markRead = async (n) => {
    if (n.read_at) return
    resource.mutate((d) => ({ ...d, unread: Math.max(0, d.unread - 1), notifications: { ...d.notifications, data: d.notifications.data.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) } }))
    try {
      await api.patch(`/notifications/${n.id}/read`)
    } catch (error) {
      toast(errorMessage(error), 'error')
      resource.reload()
    }
  }

  if (items.length === 0) return <div className="rounded-panel border border-line bg-surface"><EmptyState illustration="inbox" title="Tidak ada notifikasi" description="Belum ada pembaruan di kategori ini." /></div>

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs">
      {items.map((n) => {
        const read = n.read_at !== null
        const meta = catMeta[n.category] ?? catMeta.system
        return (
          <li key={n.id}>
            <button type="button" onClick={() => markRead(n)} className={cn('flex w-full items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-canvas/70 sm:px-5', !read && 'bg-sage/25')}>
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', meta.tint)}><meta.icon className="size-4" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className={cn('text-sm', read ? 'font-medium text-ink-2' : 'font-semibold')}>{n.title}</span>
                  <span className="shrink-0 text-xs text-ink-2">{relativeTime(n.created_at)}</span>
                </span>
                {n.body && <span className="mt-0.5 block text-sm text-ink-2">{n.body}</span>}
                {!read && <span className="sr-only">(belum dibaca)</span>}
              </span>
              {!read && <span className="mt-2 size-2 shrink-0 rounded-full bg-forest" aria-hidden="true" />}
            </button>
          </li>
        )
      })}
    </ul>
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
        subtitle={unread > 0 ? `${unread} belum dibaca.` : 'Semua sudah dibaca.'}
        action={<Button variant="secondary" onClick={markAll} disabled={unread === 0}><CheckCheck aria-hidden="true" /> Tandai semua dibaca</Button>}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <div className="thin-scroll -mx-1 mb-4 overflow-x-auto px-1 pb-1">
            <SegmentedControl label="Kategori notifikasi" options={categories} value={cat} onChange={setCat} size="sm" className="flex-nowrap" />
          </div>
          <AsyncView resource={resource}>{(data) => <NotificationList resource={resource} data={data} />}</AsyncView>
        </div>
        <Preferences />
      </div>
    </>
  )
}
