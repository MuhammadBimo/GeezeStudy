import { Link } from 'react-router-dom'
import { Flame, Play } from 'lucide-react'
import ProgressBar from '@/components/ui/ProgressBar'
import Ornament from '@/components/ui/Ornament'

const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

export default function HeroGreeting({ name, streak, studiedToday, goalMinutes, tasksLeft }) {
  return (
    <section className="dot-pattern relative overflow-hidden rounded-[1.25rem] bg-forest p-6 text-surface shadow-soft-lg sm:p-9">
      <Ornament className="pointer-events-none absolute -right-20 -top-24 size-80 text-forest-mid" />

      <div className="relative">
        <p className="text-sm text-surface/70">{today}</p>
        <h1 className="mt-1 max-w-lg text-3xl font-medium sm:text-5xl">Halo, {name}</h1>
        <p className="mt-2 max-w-md text-surface/85">
          {tasksLeft > 0
            ? `Ada ${tasksLeft} tugas yang menunggumu hari ini.`
            : 'Semua tugas hari ini beres. Mantap!'}
        </p>

        <div className="mt-7 max-w-md">
          <div className="mb-2 flex justify-between text-sm text-surface/85">
            <span>Target belajar hari ini</span>
            <span className="tabular-nums">{studiedToday}/{goalMinutes} menit</span>
          </div>
          <ProgressBar value={studiedToday} max={goalMinutes} color="bg-clay" label="Target belajar hari ini" />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/timer"
            className="inline-flex min-h-11 items-center gap-2 rounded-panel bg-surface px-5 py-2.5 font-semibold text-forest shadow-soft-sm transition-all duration-150 hover:-translate-y-px hover:bg-canvas active:translate-y-px active:scale-[0.985] motion-reduce:transition-none"
          >
            <Play className="size-4" aria-hidden="true" /> Mulai belajar
          </Link>
          <span
            aria-label={`Streak ${streak} hari`}
            className="inline-flex items-center gap-1.5 rounded-full border border-surface/25 px-3.5 py-2 text-sm font-medium"
          >
            <Flame className="size-4 text-clay" aria-hidden="true" /> Streak {streak} hari
          </span>
        </div>
      </div>
    </section>
  )
}
