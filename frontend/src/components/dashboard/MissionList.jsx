import { Flag, Check } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'

export default function MissionList({ missions }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <Flag className="size-5" aria-hidden="true" /> Misi harian
      </h2>
      <ul className="flex flex-col gap-4">
        {missions.map((m) => {
          const complete = m.done >= m.total
          return (
            <li key={m.id}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{m.title}</p>
                {complete ? (
                  <Badge color="bg-mint"><Check className="size-3" strokeWidth={3} aria-hidden="true" /> Selesai</Badge>
                ) : (
                  <Badge color="bg-yellow">+{m.reward} pts</Badge>
                )}
              </div>
              <ProgressBar value={m.done} max={m.total} color="bg-mint" label={m.title} />
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
