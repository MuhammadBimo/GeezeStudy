import { Check } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import ProgressBar from '@/components/ui/ProgressBar'

export default function MissionList({ missions }) {
  if (missions.length === 0) return <EmptyState compact illustration="target" title="Belum ada misi" description="Misi baru muncul setiap hari." />

  return (
    <ul className="space-y-4">
      {missions.map((m) => {
        const done = m.progress >= m.target
        return (
          <li key={m.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <p className="truncate font-medium">{m.title}</p>
              {m.claimed ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><Check className="size-3.5" strokeWidth={3} aria-hidden="true" />Diklaim</span>
              ) : (
                <span className={done ? 'text-xs font-semibold text-forest' : 'text-xs tabular-nums text-ink-2'}>{done ? 'Siap diklaim' : `+${m.reward_points} pts`}</span>
              )}
            </div>
            <ProgressBar size="sm" value={m.progress} max={m.target} label={m.title} />
          </li>
        )
      })}
    </ul>
  )
}
