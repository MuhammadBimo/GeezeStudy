import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Repeat, Bell } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/cn'
import { TODAY, addDays, formatLong, formatMonth, fromISO, isoIn, toISO, weekdayIndex } from '@/lib/date'

const typeMeta = {
  Kuliah: 'bg-sky',
  Deadline: 'bg-yellow',
  Ujian: 'bg-pink',
  Presentasi: 'bg-violet',
  Rapat: 'bg-orange',
  Pribadi: 'bg-mint',
}
const typeOptions = Object.keys(typeMeta).map((t) => ({ value: t, label: t }))
const repeatOptions = [
  { value: 'none', label: 'Tidak berulang' },
  { value: 'daily', label: 'Setiap hari' },
  { value: 'weekly', label: 'Setiap minggu' },
  { value: 'monthly', label: 'Setiap bulan' },
]
const reminderOptions = [
  { value: 'none', label: 'Tanpa pengingat' },
  { value: '10', label: '10 menit sebelumnya' },
  { value: '60', label: '1 jam sebelumnya' },
  { value: '1440', label: '1 hari sebelumnya' },
]
const views = [
  { value: 'month', label: 'Bulan' },
  { value: 'week', label: 'Minggu' },
  { value: 'day', label: 'Hari' },
]
const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

// DATA SEMENTARA (mock): akan diganti dengan data dari API backend.
const initialEvents = [
  { id: 1, title: 'Kuliah Pemrograman Web', type: 'Kuliah', date: isoIn(0), time: '13:00', repeat: 'weekly', reminder: '10' },
  { id: 2, title: 'Presentasi Kelompok', type: 'Presentasi', date: isoIn(0), time: '15:30', repeat: 'none', reminder: '60' },
  { id: 3, title: 'Deadline Laporan Basis Data', type: 'Deadline', date: isoIn(1), time: '23:59', repeat: 'none', reminder: '1440' },
  { id: 4, title: 'Ujian Basis Data', type: 'Ujian', date: isoIn(3), time: '08:00', repeat: 'none', reminder: '1440' },
  { id: 5, title: 'Rapat Organisasi', type: 'Rapat', date: isoIn(5), time: '16:00', repeat: 'none', reminder: 'none' },
  { id: 6, title: 'Olahraga sore', type: 'Pribadi', date: isoIn(2), time: '17:00', repeat: 'weekly', reminder: 'none' },
]

const sameMonth = (iso, cursor) => {
  const d = fromISO(iso)
  return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear()
}

function EventRow({ event }) {
  return (
    <li className="flex items-center gap-3 rounded-brutal border-2 border-ink bg-surface p-3">
      <span className={cn('size-3 shrink-0 rounded-full border-2 border-ink', typeMeta[event.type])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{event.title}</p>
        <p className="text-sm text-ink/70">{event.time} · {event.type}</p>
      </div>
      {event.repeat !== 'none' && <Repeat className="size-4 shrink-0" aria-label="Berulang" />}
      {event.reminder !== 'none' && <Bell className="size-4 shrink-0" aria-label="Ada pengingat" />}
    </li>
  )
}

export default function CalendarPage() {
  const [events, setEvents] = useState(initialEvents)
  const [view, setView] = useState('month')
  const [selected, setSelected] = useState(TODAY)
  const [cursor, setCursor] = useState(() => fromISO(`${TODAY.slice(0, 8)}01`))
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Kuliah', date: TODAY, time: '08:00', repeat: 'none', reminder: 'none' })
  const [error, setError] = useState('')

  const eventsOn = (iso) => events.filter((e) => e.date === iso).toSorted((a, b) => a.time.localeCompare(b.time))

  // Sel kalender bulanan: mulai dari hari Senin pertama yang menutupi tanggal 1.
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = addDays(-weekdayIndex(first), first)
  const cells = Array.from({ length: 42 }, (_, i) => toISO(addDays(i, gridStart)))

  const weekStart = addDays(-weekdayIndex(fromISO(selected)), fromISO(selected))
  const weekDays = Array.from({ length: 7 }, (_, i) => toISO(addDays(i, weekStart)))

  const shiftMonth = (n) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1))
  const shiftSelected = (n) => setSelected((s) => toISO(addDays(n, fromISO(s))))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('Judul dan tanggal wajib diisi.')
      return
    }
    setEvents((prev) => [...prev, { ...form, title: form.title.trim(), id: Date.now() }])
    setSelected(form.date)
    setCursor(fromISO(`${form.date.slice(0, 8)}01`))
    setOpen(false)
    setError('')
  }
  const setField = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const selectedEvents = eventsOn(selected)

  return (
    <>
      <PageHeader
        title="Kalender"
        subtitle="Jadwal kuliah, deadline, ujian, dan kegiatanmu."
        action={
          <Button onClick={() => { setForm((f) => ({ ...f, date: selected })); setOpen(true) }}>
            <Plus className="size-4" aria-hidden="true" /> Tambah kegiatan
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Tampilan kalender" options={views} value={view} onChange={setView} />
        <Badge color="bg-yellow">Data contoh (sementara)</Badge>
      </div>

      {view === 'month' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card tone="primary" className="p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold capitalize">{formatMonth(cursor)}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="neutral" aria-label="Bulan sebelumnya" onClick={() => shiftMonth(-1)}><ChevronLeft className="size-4" /></Button>
                <Button size="sm" variant="neutral" aria-label="Bulan berikutnya" onClick={() => shiftMonth(1)}><ChevronRight className="size-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold sm:gap-1.5" role="grid" aria-label={formatMonth(cursor)}>
              {dayNames.map((d) => <div key={d} className="pb-1" role="columnheader">{d}</div>)}
              {cells.map((iso) => {
                const evs = eventsOn(iso)
                const inMonth = sameMonth(iso, cursor)
                const isSel = iso === selected
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    aria-selected={isSel}
                    aria-label={`${formatLong(iso)}, ${evs.length} kegiatan`}
                    onClick={() => setSelected(iso)}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md border-2 p-1 text-sm font-bold sm:p-1.5',
                      isSel ? 'border-ink bg-pink shadow-brutal-sm' : 'border-transparent hover:border-ink hover:bg-yellow',
                      !inMonth && 'opacity-40',
                      iso === TODAY && !isSel && 'border-ink',
                    )}
                  >
                    {Number(iso.slice(8))}
                    <span className="flex flex-wrap justify-center gap-0.5">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className={cn('size-1.5 rounded-full border border-ink', typeMeta[e.type])} aria-hidden="true" />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card color="bg-sky" className="p-5">
            <h2 className="mb-3 text-xl font-extrabold">{formatLong(selected)}</h2>
            {selectedEvents.length === 0 ? (
              <EmptyState title="Tidak ada kegiatan" description="Hari ini masih kosong." />
            ) : (
              <ul className="flex flex-col gap-2">{selectedEvents.map((e) => <EventRow key={e.id} event={e} />)}</ul>
            )}
          </Card>
        </div>
      )}

      {view === 'week' && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">{formatLong(weekDays[0])} – {formatLong(weekDays[6])}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="neutral" aria-label="Minggu sebelumnya" onClick={() => shiftSelected(-7)}><ChevronLeft className="size-4" /></Button>
              <Button size="sm" variant="neutral" aria-label="Minggu berikutnya" onClick={() => shiftSelected(7)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {weekDays.map((iso) => (
              <Card key={iso} color={iso === TODAY ? 'bg-pink-soft' : 'bg-surface'} className="p-3">
                <h3 className="mb-2 font-display text-lg font-extrabold">{formatLong(iso)}</h3>
                {eventsOn(iso).length === 0 ? (
                  <p className="text-sm text-ink/60">Kosong</p>
                ) : (
                  <ul className="flex flex-col gap-2">{eventsOn(iso).map((e) => <EventRow key={e.id} event={e} />)}</ul>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {view === 'day' && (
        <Card tone="primary" color="bg-sky" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold">{formatLong(selected)}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="neutral" aria-label="Hari sebelumnya" onClick={() => shiftSelected(-1)}><ChevronLeft className="size-4" /></Button>
              <Button size="sm" variant="neutral" aria-label="Hari berikutnya" onClick={() => shiftSelected(1)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          {selectedEvents.length === 0 ? (
            <EmptyState title="Tidak ada kegiatan" description="Tambahkan jadwal untuk hari ini." />
          ) : (
            <ul className="flex flex-col gap-2">{selectedEvents.map((e) => <EventRow key={e.id} event={e} />)}</ul>
          )}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah kegiatan">
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Judul" value={form.title} onChange={setField('title')} error={error} maxLength={120} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Jenis" options={typeOptions} value={form.type} onChange={setField('type')} />
            <Input label="Tanggal" type="date" value={form.date} onChange={setField('date')} />
            <Input label="Jam" type="time" value={form.time} onChange={setField('time')} />
            <Select label="Ulangi" options={repeatOptions} value={form.repeat} onChange={setField('repeat')} />
          </div>
          <Select label="Pengingat" options={reminderOptions} value={form.reminder} onChange={setField('reminder')} />
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">Simpan kegiatan</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
