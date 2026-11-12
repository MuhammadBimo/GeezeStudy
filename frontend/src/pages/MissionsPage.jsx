import { useState } from 'react'
import { Check, Gift } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'

const periods = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
]

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
      toast(`+${data.reward_points} Points diklaim`)
      resource.reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
      resource.reload()
    } finally {
      setClaiming(null)
    }
  }

  const visible = missions.filter((m) => m.type === period)
  const claimedPoints = missions.filter((m) => m.claimed).reduce((sum, m) => sum + m.reward_points, 0)

  return (
    <>
      <PageHeader
        title="Misi"
        subtitle="Tantangan produktivitas. Selesaikan, lalu klaim Points-nya."
        action={<Badge color="bg-sand-deep" className="px-3 py-1 text-sm">+{claimedPoints} Points sudah diklaim</Badge>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Periode misi" options={periods} value={period} onChange={setPeriod} />
        <p className="text-sm text-ink/80">
          {period === 'daily' ? 'Reset setiap hari pukul 00.00.' : 'Reset setiap hari Senin pukul 00.00.'}
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Belum ada misi" description="Misi baru akan muncul di sini." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((m) => (
            <Card as="li" key={m.id} color={m.claimed ? 'bg-moss' : m.claimable ? 'bg-sand-deep' : 'bg-surface'} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold leading-snug">{m.title}</h2>
                <Badge color="bg-forest-tint">+{m.reward_points} pts</Badge>
              </div>
              <ProgressBar value={m.progress} max={m.target} label={m.title} />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{m.progress} / {m.target}</p>
                {m.claimed ? (
                  <Badge color="bg-surface"><Check className="size-3" strokeWidth={3} aria-hidden="true" /> Diklaim</Badge>
                ) : m.claimable ? (
                  <Button size="sm" onClick={() => claim(m)} loading={claiming === m.id}><Gift className="size-4" aria-hidden="true" /> Klaim</Button>
                ) : (
                  <span className="text-sm text-ink/80">Belum selesai</span>
                )}
              </div>
            </Card>
          ))}
        </ul>
      )}
    </>
  )
}

export default function MissionsPage() {
  const resource = useResource('/missions')
  return <AsyncView resource={resource}>{(page) => <MissionBoard resource={resource} missions={page.data} />}</AsyncView>
}
