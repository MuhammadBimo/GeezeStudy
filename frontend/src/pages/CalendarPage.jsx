import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Repeat, Bell, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { eventFromApi, eventToApi } from '@/lib/mappers'
import { cn } from '@/lib/cn'
import { TODAY, addDays, formatLong, formatMonth, fromISO, toISO, weekdayIndex } from '@/lib/date'

const typeMeta = {
  Kuliah: 'bg-mist',
  Deadline: 'bg-sand-deep',
  Ujian: 'bg-sage',
  Presentasi: 'bg-stone',
  Rapat: 'bg-clay',
  Pribadi: 'bg-moss',
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

// Apakah kegiatan (termasuk yang berulang) jatuh pada tanggal tertentu.
const occursOn = (event, iso) => {
  if (event.date === iso) return true
  if (event.repeat === 'none' || iso < event.date) return false
  const start = fromISO(event.date)
  const day = fromISO(iso)
  if (event.repeat === 'daily') return true
  if (event.repeat === 'weekly') return start.getDay() === day.getDay()
  return start.getDate() === day.getDate()
}

const sameMonth = (iso, cursor) => {
  const d = fromISO(iso)
  return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear()
}

function EventRow({ event, onDelete }) {
  return (
    <li className="flex items-center gap-3 rounded-panel border border-line bg-surface p-3">
      <span className={cn('size-3 shrink-0 rounded-full border border-line', typeMeta[event.type])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{event.title}</p>
        <p className="text-sm text-ink/80">{event.time} · {event.type}</p>
      </div>
      {event.repeat !== 'none' && <Repeat className="size-4 shrink-0" aria-label="Berulang" />}
      {event.reminder !== 'none' && <Bell className="size-4 shrink-0" aria-label="Ada pengingat" />}
      <button
        type="button"
        onClick={() => onDelete(event)}
        aria-label={`Hapus kegiatan ${event.title}`}
        className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </li>
  )
}

export default function CalendarPage() {
  const toast = useToast()
  const [view, setView] = useState('month')
  const [selected, setSelected] = useState(TODAY)
  const [cursor, setCursor] = useState(() => fromISO(`${TODAY.slice(0, 8)}01`))
  const [saving, setSaving] = useState(false)

  // Ambil kegiatan satu bulan sebelum sampai satu bulan sesudah bulan yang tampil.
  const range = {
    from: new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1).toISOString(),
    to: new Date(cursor.getFullYear(), cursor.getMonth() + 2, 1).toISOString(),
  }
  const resource = useResource('/calendar-events', range)
  const events = (resource.data?.data ?? []).map(eventFromApi)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Kuliah', date: TODAY, time: '08:00', repeat: 'none', reminder: 'none' })
  const [error, setError] = useState('')

  const eventsOn = (iso) => events.filter((e) => occursOn(e, iso)).toSorted((a, b) => a.time.localeCompare(b.time))

  // Sel kalender bulanan: mulai dari hari Senin pertama yang menutupi tanggal 1.
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = addDays(-weekdayIndex(first), first)
  const cells = Array.from({ length: 42 }, (_, i) => toISO(addDays(i, gridStart)))

  const weekStart = addDays(-weekdayIndex(fromISO(selected)), fromISO(selected))
  const weekDays = Array.from({ length: 7 }, (_, i) => toISO(addDays(i, weekStart)))

  const shiftMonth = (n) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1))
  const shiftSelected = (n) => {
    const next = toISO(addDays(n, fromISO(selected)))
    setSelected(next)
    setCursor(fromISO(`${next.slice(0, 8)}01`))
  }

  const remove = async (event) => {
    if (!window.confirm(`Hapus kegiatan "${event.title}"?`)) return
    try {
      await api.delete(`/calendar-events/${event.id}`)
      resource.reload()
      toast('Kegiatan dihapus')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('Judul dan tanggal wajib diisi.')
      return
    }
    setSaving(true)
    try {
      await api.post('/calendar-events', eventToApi({ ...form, title: form.title.trim() }))
      setSelected(form.date)
      setCursor(fromISO(`${form.date.slice(0, 8)}01`))
      setOpen(false)
      setError('')
      resource.reload()
      toast('Kegiatan ditambahkan')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
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
        {resource.error && (
          <p role="alert" className="text-sm font-semibold text-danger">
            Kegiatan belum bisa dimuat. <button type="button" className="underline underline-offset-4" onClick={resource.reload}>Coba lagi</button>
          </p>
        )}
      </div>

      {view === 'month' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card tone="primary" className="p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium capitalize">{formatMonth(cursor)}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="neutral" aria-label="Bulan sebelumnya" onClick={() => shiftMonth(-1)}><ChevronLeft className="size-4" /></Button>
                <Button size="sm" variant="neutral" aria-label="Bulan berikutnya" onClick={() => shiftMonth(1)}><ChevronRight className="size-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold sm:gap-1.5" role="group" aria-label={formatMonth(cursor)}>
              {dayNames.map((d) => <div key={d} className="pb-1" aria-hidden="true">{d}</div>)}
              {cells.map((iso) => {
                const evs = eventsOn(iso)
                const inMonth = sameMonth(iso, cursor)
                const isSel = iso === selected
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={isSel}
                    aria-label={`${formatLong(iso)}, ${evs.length} kegiatan`}
                    onClick={() => setSelected(iso)}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md border p-1 text-sm font-semibold sm:p-1.5',
                      isSel ? 'border-line bg-sage shadow-soft-sm' : 'border-transparent hover:border-line hover:bg-sand-deep',
                      !inMonth && 'text-ink/80',
                      iso === TODAY && !isSel && 'border-line',
                    )}
                  >
                    {Number(iso.slice(8))}
                    <span className="flex flex-wrap justify-center gap-0.5">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className={cn('size-1.5 rounded-full border border-line', typeMeta[e.type])} aria-hidden="true" />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card color="bg-mist" className="p-5">
            <h2 className="mb-3 text-xl font-semibold">{formatLong(selected)}</h2>
            {selectedEvents.length === 0 ? (
              <EmptyState title="Tidak ada kegiatan" description="Hari ini masih kosong." />
            ) : (
              <ul className="flex flex-col gap-2">{selectedEvents.map((e) => <EventRow key={e.id} event={e} onDelete={remove} />)}</ul>
            )}
          </Card>
        </div>
      )}

      {view === 'week' && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{formatLong(weekDays[0])} – {formatLong(weekDays[6])}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="neutral" aria-label="Minggu sebelumnya" onClick={() => shiftSelected(-7)}><ChevronLeft className="size-4" /></Button>
              <Button size="sm" variant="neutral" aria-label="Minggu berikutnya" onClick={() => shiftSelected(7)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {weekDays.map((iso) => (
              <Card key={iso} color={iso === TODAY ? 'bg-forest-tint' : 'bg-surface'} className="p-3">
                <h3 className="mb-2 font-display text-lg font-medium">{formatLong(iso)}</h3>
                {eventsOn(iso).length === 0 ? (
                  <p className="text-sm text-ink/80">Kosong</p>
                ) : (
                  <ul className="flex flex-col gap-2">{eventsOn(iso).map((e) => <EventRow key={e.id} event={e} onDelete={remove} />)}</ul>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {view === 'day' && (
        <Card tone="primary" color="bg-mist" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium">{formatLong(selected)}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="neutral" aria-label="Hari sebelumnya" onClick={() => shiftSelected(-1)}><ChevronLeft className="size-4" /></Button>
              <Button size="sm" variant="neutral" aria-label="Hari berikutnya" onClick={() => shiftSelected(1)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          {selectedEvents.length === 0 ? (
            <EmptyState title="Tidak ada kegiatan" description="Tambahkan jadwal untuk hari ini." />
          ) : (
            <ul className="flex flex-col gap-2">{selectedEvents.map((e) => <EventRow key={e.id} event={e} onDelete={remove} />)}</ul>
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
            <Button type="submit" loading={saving}>Simpan kegiatan</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
