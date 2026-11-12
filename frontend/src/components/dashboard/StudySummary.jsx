import { Clock } from 'lucide-react'
import Card from '@/components/ui/Card'

const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

// Hari ini = indeks 0 (Senin) s.d. 6 (Minggu), dihitung dari tanggal sistem.
const todayIndex = (new Date().getDay() + 6) % 7

export default function StudySummary({ minutes }) {
  const total = minutes.reduce((a, b) => a + b, 0)
  const max = Math.max(...minutes, 1)

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <Clock className="size-5" aria-hidden="true" /> Waktu belajar minggu ini
        </h2>
        <p className="font-display text-2xl font-extrabold">
          {Math.floor(total / 60)} jam {total % 60} mnt
        </p>
      </div>

      <ul className="grid h-40 grid-cols-7 items-end gap-2 sm:gap-3">
        {minutes.map((m, i) => (
          <li key={days[i]} className="flex h-full flex-col justify-end gap-1" aria-label={`${days[i]}: ${m} menit`}>
            <span className="text-center text-xs font-bold">{m > 0 ? m : ''}</span>
            <div
              className={`w-full rounded-t-md border-2 border-ink ${i === todayIndex ? 'bg-pink' : 'bg-mint'}`}
              style={{ height: `${Math.max((m / max) * 100, m > 0 ? 6 : 2)}%` }}
            />
          </li>
        ))}
      </ul>
      <ul className="mt-2 grid grid-cols-7 gap-2 sm:gap-3" aria-hidden="true">
        {days.map((d, i) => (
          <li key={d} className={`text-center text-xs font-bold ${i === todayIndex ? 'underline decoration-pink decoration-2 underline-offset-4' : ''}`}>{d}</li>
        ))}
      </ul>
    </Card>
  )
}
