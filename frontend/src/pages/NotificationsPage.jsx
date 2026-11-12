import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Toggle from '@/components/ui/Toggle'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/mappers'

const catMeta = {
  deadline: { label: 'Tenggat', color: 'bg-clay' },
  schedule: { label: 'Jadwal', color: 'bg-mist' },
  mission: { label: 'Misi', color: 'bg-moss' },
  social: { label: 'Sosial', color: 'bg-sage' },
  achievement: { label: 'Achievements', color: 'bg-sand-deep' },
  system: { label: 'Sistem', color: 'bg-surface' },
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
    <Card color="bg-mist" className="h-fit p-5">
      <h2 className="mb-4 text-xl font-semibold">Preferensi</h2>
      <ul className="flex flex-col gap-3">
        {Object.entries(catMeta).map(([key, meta]) => (
          <li key={key} className="flex items-center justify-between gap-3">
            <span className="font-semibold">{meta.label}</span>
            <Toggle
              label={`Notifikasi ${meta.label}`}
              checked={prefs[key] !== false}
              onChange={(v) => save({ notification_prefs: { ...prefs, [key]: v } })}
            />
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-medium">Jam tenang</h3>
            <p className="text-sm">Notifikasi dibisukan pada jam ini.</p>
          </div>
          <Toggle label="Jam tenang" checked={quiet !== null && quiet !== undefined} onChange={(v) => save({ quiet_hours: v ? draft : null })} />
        </div>
        {quiet && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mulai" type="time" value={draft.from} onChange={(e) => saveHours({ ...draft, from: e.target.value })} />
            <Input label="Selesai" type="time" value={draft.to} onChange={(e) => saveHours({ ...draft, to: e.target.value })} />
          </div>
        )}
      </div>
    </Card>
  )
}

function NotificationList({ resource, data }) {
  const toast = useToast()
  const items = data.notifications.data

  const markRead = async (n) => {
    if (n.read_at) return
    try {
      await api.patch(`/notifications/${n.id}/read`)
      resource.reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  if (items.length === 0) {
    return <EmptyState icon={BellOff} title="Tidak ada notifikasi" description="Belum ada pembaruan di kategori ini." />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((n) => {
        const read = n.read_at !== null
        const meta = catMeta[n.category] ?? catMeta.system
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => markRead(n)}
              className={cn(
                'flex w-full items-start gap-3 rounded-panel border border-line p-4 text-left shadow-soft-sm transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                read ? 'bg-surface' : 'bg-forest-tint',
              )}
            >
              <span className={cn('mt-1.5 size-3 shrink-0 rounded-full border border-line', read ? 'bg-surface' : 'bg-forest')} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="font-semibold">{n.title}</span>
                {!read && <span className="sr-only"> (belum dibaca)</span>}
                {n.body && <span className="block text-sm text-ink/80">{n.body}</span>}
                <span className="mt-2 flex items-center gap-2 text-xs">
                  <Badge color={meta.color}>{meta.label}</Badge>
                  {relativeTime(n.created_at)}
                </span>
              </span>
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
        action={
          <Button variant="neutral" onClick={markAll} disabled={unread === 0}>
            <CheckCheck className="size-4" aria-hidden="true" /> Tandai semua dibaca
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <SegmentedControl label="Kategori notifikasi" options={categories} value={cat} onChange={setCat} />
          </div>
          <AsyncView resource={resource}>{(data) => <NotificationList resource={resource} data={data} />}</AsyncView>
        </div>
        <Preferences />
      </div>
    </>
  )
}
