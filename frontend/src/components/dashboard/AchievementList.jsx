import { Award, Flag, Flame, Lock, Timer } from 'lucide-react'
import Card from '@/components/ui/Card'

const icons = { flag: Flag, flame: Flame, timer: Timer }

export default function AchievementList({ items }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <Award className="size-5" aria-hidden="true" /> Achievements
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((a) => {
          const Icon = a.unlocked ? icons[a.icon] ?? Award : Lock
          return (
            <li key={a.id} className="flex items-center gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink ${
                  a.unlocked ? 'bg-orange shadow-brutal-sm' : 'bg-surface'
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold leading-tight">{a.title}</p>
                <p className="text-sm text-ink/70">{a.unlocked ? a.desc : `Terkunci · ${a.desc}`}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
