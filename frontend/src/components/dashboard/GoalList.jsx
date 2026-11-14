import EmptyState from '@/components/ui/EmptyState'
import { ProgressRing } from '@/components/ui/ProgressBar'

const periodLabel = { daily: 'Harian', weekly: 'Mingguan', long: 'Jangka panjang' }

export default function GoalList({ goals }) {
  if (goals.length === 0) return <EmptyState compact illustration="target" title="Belum ada goal aktif" description="Buat goal di halaman Goals." />

  return (
    <ul className="space-y-3">
      {goals.map((g) => (
        <li key={g.id} className="flex items-center gap-3">
          <ProgressRing value={g.progress} max={g.target} size={40} stroke={4} label={g.title} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{g.title}</p>
            <p className="text-xs text-ink-2">{periodLabel[g.period]} · {g.progress}/{g.target}{g.unit !== 'lainnya' ? ` ${g.unit}` : ''}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
