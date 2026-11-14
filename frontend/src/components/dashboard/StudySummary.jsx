import { cn } from '@/lib/cn'

const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const todayIndex = (new Date().getDay() + 6) % 7

// Grafik batang minimal: garis target harian sebagai acuan, hari ini disorot.
export default function StudySummary({ minutes, goal }) {
  const total = minutes.reduce((a, b) => a + b, 0)
  const max = Math.max(...minutes, goal, 1)

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <p className="font-display text-[1.75rem] leading-none tabular-nums">{Math.floor(total / 60)}<span className="font-sans text-base text-ink-2"> jam </span>{total % 60}<span className="font-sans text-base text-ink-2"> menit</span></p>
        <p className="text-sm text-ink-2">minggu ini</p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-forest/30" style={{ bottom: `calc(${(goal / max) * 100}% * 0.86 + 1.5rem)` }} aria-hidden="true">
          <span className="absolute -top-2.5 right-0 bg-surface pl-1.5 text-[0.6875rem] text-ink-2">target {goal}</span>
        </div>
        <ul className="grid h-40 grid-cols-7 items-end gap-2 sm:gap-3">
          {minutes.map((m, i) => (
            <li key={days[i]} className="flex h-full flex-col items-center justify-end gap-1.5" aria-label={`${days[i]}: ${m} menit`}>
              <div
                className={cn('w-full max-w-9 rounded-md transition-[height] duration-500', i === todayIndex ? 'bg-forest' : m >= goal ? 'bg-forest/55' : 'bg-sage-deep')}
                style={{ height: `${Math.max((m / max) * 86, m > 0 ? 4 : 1.5)}%` }}
              />
              <span className={cn('text-[0.6875rem]', i === todayIndex ? 'font-semibold text-ink' : 'text-muted')}>{days[i]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
