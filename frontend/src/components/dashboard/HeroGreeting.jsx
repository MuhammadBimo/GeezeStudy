import { Link } from 'react-router-dom'
import { Flame, Play } from 'lucide-react'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'

const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

export default function HeroGreeting({ name, streak, studiedToday, goalMinutes, tasksLeft }) {
  return (
    <Card color="bg-pink" tone="primary" className="relative overflow-hidden p-6 sm:p-8">
      <div
        aria-label={`Streak ${streak} hari`}
        className="absolute right-4 top-4 flex rotate-3 items-center gap-1 rounded-brutal border-2 border-ink bg-yellow px-3 py-1.5 font-display font-extrabold shadow-brutal-sm sm:right-6 sm:top-6"
      >
        <Flame className="size-5" aria-hidden="true" /> {streak} hari
      </div>

      <p className="text-sm font-bold">{today}</p>
      <h1 className="mt-1 pr-24 text-3xl font-extrabold sm:text-5xl">Halo, {name}!</h1>
      <p className="mt-2 max-w-md font-medium">
        {tasksLeft > 0
          ? `Ada ${tasksLeft} tugas yang menunggumu hari ini.`
          : 'Semua tugas hari ini beres. Mantap!'}
      </p>

      <div className="mt-6 max-w-md">
        <div className="mb-1 flex justify-between text-sm font-bold">
          <span>Target belajar hari ini</span>
          <span>{studiedToday}/{goalMinutes} menit</span>
        </div>
        <ProgressBar value={studiedToday} max={goalMinutes} color="bg-yellow" label="Target belajar hari ini" />
      </div>

      <Link
        to="/timer"
        className="mt-6 inline-flex items-center gap-2 rounded-brutal border-2 border-ink bg-surface px-5 py-2.5 font-bold shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <Play className="size-4" aria-hidden="true" /> Mulai belajar
      </Link>
    </Card>
  )
}
