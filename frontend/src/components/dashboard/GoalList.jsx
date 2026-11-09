import { Target } from 'lucide-react'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'

export default function GoalList({ goals }) {
  return (
    <Card color="bg-yellow" className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <Target className="size-5" aria-hidden="true" /> Progres Goals
      </h2>
      <ul className="flex flex-col gap-4">
        {goals.map((g) => (
          <li key={g.id}>
            <p className="text-sm font-bold">{g.title}</p>
            <p className="mb-1 text-xs font-medium">{g.done} / {g.total} {g.unit}</p>
            <ProgressBar value={g.done} max={g.total} color="bg-pink" label={g.title} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
