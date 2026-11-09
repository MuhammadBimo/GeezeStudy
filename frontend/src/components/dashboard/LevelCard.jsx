import { Flame } from 'lucide-react'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'

const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M']
const todayIndex = (new Date().getDay() + 6) % 7

export default function LevelCard({ level, points, nextLevelAt, streak, weekActive }) {
  return (
    <Card color="bg-violet" className="flex flex-col gap-5 p-5">
      <div>
        <h2 className="text-xl font-extrabold">Level {level}</h2>
        <p className="mb-2 text-sm font-medium">{points} / {nextLevelAt} Points menuju Level {level + 1}</p>
        <ProgressBar value={points} max={nextLevelAt} color="bg-yellow" label="Progres menuju level berikutnya" />
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 font-display text-lg font-extrabold">
          <Flame className="size-5" aria-hidden="true" /> Streak {streak} hari
        </h3>
        <ul className="flex justify-between gap-1">
          {weekActive.map((active, i) => (
            <li
              key={i}
              aria-label={`${active ? 'Aktif' : 'Tidak aktif'}`}
              className={`grid size-9 place-items-center rounded-full border-2 border-ink text-xs font-bold ${
                active ? 'bg-orange' : 'bg-surface'
              } ${i === todayIndex ? 'ring-2 ring-ink ring-offset-2 ring-offset-violet' : ''}`}
            >
              {days[i]}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
