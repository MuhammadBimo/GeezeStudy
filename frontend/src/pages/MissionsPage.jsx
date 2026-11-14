import { useState } from 'react'
import { Check, Gift, ListChecks, Timer } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'

const periods = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
]

// Sisa waktu sampai misi direset (tengah malam / Senin 00.00).
function resetIn(period) {
  const now = new Date()
  const end = new Date(now)
  if (period === 'daily') end.setHours(24, 0, 0, 0)
  else { end.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7)); end.setHours(0, 0, 0, 0) }
  const h = Math.floor((end - now) / 3_600_000)
  return h >= 24 ? `${Math.floor(h / 24)} hari ${h % 24} jam` : `${h} jam ${Math.floor(((end - now) % 3_600_000) / 60_000)} menit`
}

function MissionBoard({ resource, missions }) {
  const toast = useToast()
  const { setUser } = useAuth()
  const [period, setPeriod] = useState('daily')
  const [claiming, setClaiming] = useState(null)

  // Klaim divalidasi server: progres dihitung ulang dan tiap misi hanya bisa diklaim sekali per periode.
  const claim = async (mission) => {
    setClaiming(mission.id)
    try {
      const { data } = await api.post(`/missions/${mission.id}/claim`)
      setUser(data.user)
      toast.success(`+${data.reward_points} Points diklaim`, { description: mission.title })
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setClaiming(null)
      resource.reload()
    }
  }

  const visible = missions.filter((m) => m.type === period)
  const claimable = visible.filter((m) => m.claimable).length
  const earned = visible.filter((m) => m.claimed).reduce((s, m) => s + m.reward_points, 0)
  const possible = visible.reduce((s, m) => s + m.reward_points, 0)

  return (
    <>
      <PageHeader title="Misi" subtitle="Tantangan kecil yang membuat kebiasaan belajar terasa ringan. Selesaikan, lalu klaim Points-nya." />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Periode misi" options={periods.map((p) => ({ ...p, count: missions.filter((m) => m.type === p.value && m.claimable).length || undefined }))} value={period} onChange={setPeriod} />
        <p className="text-sm text-ink-2">Reset dalam <span className="font-semibold text-ink">{resetIn(period)}</span></p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        {visible.length === 0 ? (
          <div className="rounded-panel border border-line bg-surface"><EmptyState illustration="target" title="Belum ada misi" description="Misi baru akan muncul di sini." /></div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs">
            {visible.map((m) => {
              const Icon = m.title.toLowerCase().includes('tugas') ? ListChecks : Timer
              return (
                <li key={m.id} className={cn('flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap', m.claimable && 'bg-sand-soft/70')}>
                  <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', m.claimed ? 'bg-success-soft text-success' : 'bg-sage text-forest')}>
                    {m.claimed ? <Check className="size-5" strokeWidth={2.5} aria-hidden="true" /> : <Icon className="size-5" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-semibold">{m.title}</h2>
                      <span className="shrink-0 text-sm tabular-nums text-ink-2">{m.progress}/{m.target}</span>
                    </div>
                    <ProgressBar className="mt-2" size="sm" value={m.progress} max={m.target} label={m.title} />
                  </div>
                  <div className="w-full sm:w-32 sm:text-right">
                    {m.claimed ? (
                      <span className="text-sm font-semibold text-success">+{m.reward_points} diklaim</span>
                    ) : m.claimable ? (
                      <Button size="sm" className="w-full sm:w-auto" onClick={() => claim(m)} loading={claiming === m.id}><Gift aria-hidden="true" /> Klaim +{m.reward_points}</Button>
                    ) : (
                      <span className="text-sm text-ink-2">+{m.reward_points} Points</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <aside className="h-fit rounded-panel border border-sand bg-sand-soft p-5">
          <h2 className="text-sm font-medium text-ink-2">Points misi {period === 'daily' ? 'hari ini' : 'minggu ini'}</h2>
          <p className="mt-1 font-display text-[2.25rem] leading-tight tabular-nums">{earned}<span className="font-sans text-base text-ink-2"> / {possible}</span></p>
          <p className="mt-2 text-sm text-ink-2">{claimable > 0 ? `${claimable} misi siap diklaim.` : 'Selesaikan misi untuk membuka klaim.'}</p>
        </aside>
      </div>
    </>
  )
}

export default function MissionsPage() {
  const resource = useResource('/missions')
  return <AsyncView resource={resource}>{(page) => <MissionBoard resource={resource} missions={page.data} />}</AsyncView>
}
