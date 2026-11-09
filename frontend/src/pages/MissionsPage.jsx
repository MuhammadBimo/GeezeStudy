import { useState } from 'react'
import { Check, Gift } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import SegmentedControl from '@/components/ui/SegmentedControl'

const periods = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
]

// DATA SEMENTARA (mock): misi dan klaim Points akan divalidasi oleh backend.
const initialMissions = [
  { id: 1, period: 'daily', title: 'Selesaikan 2 tugas', done: 1, total: 2, reward: 20, claimed: false },
  { id: 2, period: 'daily', title: 'Belajar 25 menit', done: 25, total: 25, reward: 15, claimed: false },
  { id: 3, period: 'daily', title: 'Capai target belajar harian', done: 45, total: 90, reward: 30, claimed: false },
  { id: 4, period: 'weekly', title: 'Belajar 5 hari berbeda', done: 4, total: 5, reward: 60, claimed: false },
  { id: 5, period: 'weekly', title: 'Selesaikan 8 tugas', done: 5, total: 8, reward: 80, claimed: false },
  { id: 6, period: 'weekly', title: 'Selesaikan 3 sesi 50 menit', done: 3, total: 3, reward: 70, claimed: false },
]

export default function MissionsPage() {
  const [missions, setMissions] = useState(initialMissions)
  const [period, setPeriod] = useState('daily')

  const claim = (id) => setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, claimed: true } : m)))
  const visible = missions.filter((m) => m.period === period)
  const earned = missions.filter((m) => m.claimed).reduce((sum, m) => sum + m.reward, 0)

  return (
    <>
      <PageHeader
        title="Misi"
        subtitle="Tantangan produktivitas. Selesaikan, lalu klaim Points-nya."
        action={<Badge color="bg-yellow" className="px-3 py-1 text-sm">+{earned} Points sesi ini</Badge>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Periode misi" options={periods} value={period} onChange={setPeriod} />
        <p className="text-sm text-ink/70">
          {period === 'daily' ? 'Reset setiap hari pukul 00.00.' : 'Reset setiap hari Senin pukul 00.00.'}
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {visible.map((m) => {
          const complete = m.done >= m.total
          return (
            <Card as="li" key={m.id} color={m.claimed ? 'bg-mint' : complete ? 'bg-yellow' : 'bg-surface'} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-extrabold leading-snug">{m.title}</h2>
                <Badge color="bg-pink">+{m.reward} pts</Badge>
              </div>
              <ProgressBar value={m.done} max={m.total} color="bg-mint" label={m.title} />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{m.done} / {m.total}</p>
                {m.claimed ? (
                  <Badge color="bg-surface"><Check className="size-3" strokeWidth={3} aria-hidden="true" /> Diklaim</Badge>
                ) : complete ? (
                  <Button size="sm" onClick={() => claim(m.id)}><Gift className="size-4" aria-hidden="true" /> Klaim</Button>
                ) : (
                  <span className="text-sm text-ink/70">Belum selesai</span>
                )}
              </div>
            </Card>
          )
        })}
      </ul>
    </>
  )
}
