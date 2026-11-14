import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'

const typeLabel = { class: 'Kuliah / kelas', deadline: 'Deadline', exam: 'Ujian', presentation: 'Presentasi', meeting: 'Rapat', personal: 'Pribadi' }
const typeDot = { class: 'bg-forest', deadline: 'bg-danger', exam: 'bg-[#b5832a]', presentation: 'bg-info', meeting: 'bg-sage-deep', personal: 'bg-muted' }
const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
const clockFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })

const dayLabel = (d) => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Hari ini'
  if (d.toDateString() === tomorrow.toDateString()) return 'Besok'
  return dayFmt.format(d)
}

// Agenda sebagai garis waktu: jam di kiri, titik berwarna sesuai jenis kegiatan.
export default function AgendaTimeline({ events }) {
  if (events.length === 0) {
    return <EmptyState illustration="calendar" title="Belum ada agenda" description="Tambahkan jadwal kelas atau ujian di Kalender." />
  }

  return (
    <ol className="relative">
      {events.map((e, i) => {
        const d = new Date(e.starts_at)
        const showDay = i === 0 || dayLabel(new Date(events[i - 1].starts_at)) !== dayLabel(d)
        return (
          <li key={e.id}>
            {showDay && <p className={cn('mb-2 text-xs font-medium text-ink-2', i > 0 && 'mt-4')}>{dayLabel(d)}</p>}
            <div className="relative flex gap-3 pb-3 pl-1">
              <span className="w-11 shrink-0 pt-px text-sm tabular-nums text-ink-2">{clockFmt.format(d).replace(':', '.')}</span>
              <span className="relative flex flex-col items-center">
                <span className={cn('mt-1.5 size-2.5 rounded-full ring-4 ring-surface', typeDot[e.type] ?? 'bg-muted')} />
                <span className="w-px flex-1 bg-line" />
              </span>
              <div className="min-w-0 flex-1 pb-1">
                <p className="truncate font-medium leading-snug">{e.title}</p>
                <p className="text-[0.8125rem] text-ink-2">{typeLabel[e.type] ?? 'Kegiatan'}{e.repeat !== 'none' ? ' · rutin' : ''}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
