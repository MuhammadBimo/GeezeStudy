import { Award, Lock } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'

export default function AchievementList({ items }) {
  if (items.length === 0) return <EmptyState compact illustration="trophy" title="Belum ada achievement" />

  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li key={a.id} className="flex items-center gap-3">
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', a.unlocked ? 'bg-sand text-[#6b5326]' : 'bg-ink/[0.05] text-muted')}>
            {a.unlocked ? <Award className="size-5" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <p className={cn('truncate text-sm font-medium', !a.unlocked && 'text-ink-2')}>{a.title}</p>
            <p className="truncate text-xs text-ink-2">{a.unlocked ? a.description : `Terkunci · ${a.description}`}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
