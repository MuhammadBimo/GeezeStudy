import { Flame } from 'lucide-react'
import ProgressBar, { ProgressRing } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'

const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M']
const todayIndex = (new Date().getDay() + 6) % 7

// Tiga ukuran inti hari ini dalam satu panel bergaris, bukan tiga kartu terpisah.
export default function TodayStrip({ studied, goal, streak, best, weekActive, level, points, floor, next }) {
  const maxed = next === null || next === undefined
  const left = Math.max(goal - studied, 0)

  return (
    <section aria-label="Ringkasan hari ini" className="grid divide-y divide-line rounded-panel border border-line bg-surface shadow-xs md:grid-cols-3 md:divide-x md:divide-y-0">
      <div className="flex items-center gap-4 p-5">
        <ProgressRing value={studied} max={goal} size={72} stroke={7} label="Target belajar hari ini">
          <span className="text-sm font-semibold tabular-nums">{Math.min(100, Math.round((studied / Math.max(goal, 1)) * 100))}%</span>
        </ProgressRing>
        <div>
          <p className="text-sm text-ink-2">Target belajar</p>
          <p className="font-display text-[1.75rem] leading-tight tabular-nums">{studied}<span className="font-sans text-base text-ink-2">/{goal} menit</span></p>
          <p className="text-xs text-ink-2">{left > 0 ? `${left} menit lagi` : 'Target hari ini tercapai'}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-ink-2">Streak</p>
          <p className="text-xs text-ink-2">Terbaik {best} hari</p>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 font-display text-[1.75rem] leading-tight tabular-nums">
          <Flame className={cn('size-5', streak > 0 ? 'text-[#b5832a]' : 'text-muted')} aria-hidden="true" />{streak}<span className="font-sans text-base text-ink-2">hari</span>
        </p>
        <ul className="mt-3 flex gap-1.5" aria-label="Hari aktif minggu ini">
          {weekActive.map((active, i) => (
            <li key={i} aria-label={`${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][i]}: ${active ? 'aktif' : 'tidak aktif'}`} className="flex flex-1 flex-col items-center gap-1">
              <span className={cn('h-1.5 w-full rounded-full', active ? 'bg-forest' : 'bg-ink/10', i === todayIndex && !active && 'bg-ink/25')} />
              <span className={cn('text-[0.6875rem]', i === todayIndex ? 'font-semibold text-ink' : 'text-muted')}>{days[i]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-ink-2">Level</p>
          <p className="text-xs tabular-nums text-ink-2">{points.toLocaleString('id-ID')} Points</p>
        </div>
        <p className="mt-0.5 font-display text-[1.75rem] leading-tight tabular-nums">{level}</p>
        <ProgressBar className="mt-3" size="sm" value={maxed ? 1 : points - floor} max={maxed ? 1 : next - floor} label="Progres menuju level berikutnya" />
        <p className="mt-1.5 text-xs text-ink-2">{maxed ? 'Level tertinggi tercapai' : `${(next - points).toLocaleString('id-ID')} Points lagi ke Level ${level + 1}`}</p>
      </div>
    </section>
  )
}
