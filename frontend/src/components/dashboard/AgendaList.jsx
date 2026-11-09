import { CalendarClock, CalendarX } from 'lucide-react'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

export default function AgendaList({ items }) {
  return (
    <Card color="bg-sky" className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <CalendarClock className="size-5" aria-hidden="true" /> Agenda terdekat
      </h2>
      {items.length === 0 ? (
        <EmptyState icon={CalendarX} title="Belum ada agenda" description="Tambahkan jadwal di Kalender." />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-brutal border-2 border-ink bg-surface p-3">
              <p className="text-xs font-bold text-ink/60">{a.type}</p>
              <p className="font-display text-lg font-extrabold leading-tight">{a.time}</p>
              <p className="text-sm font-medium">{a.title}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
