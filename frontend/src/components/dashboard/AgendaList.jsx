import { CalendarClock, CalendarX } from 'lucide-react'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

export default function AgendaList({ items }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <CalendarClock className="size-5" aria-hidden="true" /> Agenda terdekat
      </h2>
      {items.length === 0 ? (
        <EmptyState icon={CalendarX} title="Belum ada agenda" description="Tambahkan jadwal di Kalender." />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-panel border border-line bg-surface p-3">
              <p className="text-xs font-semibold text-ink/80">{a.type}</p>
              <p className="font-display text-lg font-medium leading-tight">{a.time}</p>
              <p className="text-sm font-medium">{a.title}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
