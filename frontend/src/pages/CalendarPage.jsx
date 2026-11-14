import { useState } from 'react'
import { Bell, ChevronLeft, ChevronRight, Plus, Repeat, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Menu from '@/components/ui/Menu'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import TimePicker from '@/components/ui/TimePicker'
import { useConfirm } from '@/hooks/useConfirm'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { TODAY, addDays, formatLong, formatMonth, fromISO, toISO, weekdayIndex } from '@/lib/date'
import { eventFromApi, eventToApi, eventTypeOptions } from '@/lib/mappers'

const typeStyle = {
  Kuliah: { dot: 'bg-forest', chip: 'border-forest bg-sage/70 text-forest' },
  Deadline: { dot: 'bg-danger', chip: 'border-danger bg-danger-soft text-danger' },
  Ujian: { dot: 'bg-[#b5832a]', chip: 'border-[#b5832a] bg-sand-soft text-[#6b5326]' },
  Presentasi: { dot: 'bg-info', chip: 'border-info bg-info-soft text-info' },
  Rapat: { dot: 'bg-sage-deep', chip: 'border-sage-deep bg-sage/60 text-ink' },
  Pribadi: { dot: 'bg-muted', chip: 'border-muted bg-ink/[0.04] text-ink-2' },
}
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
const shortDay = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })

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

function EventRow({ event, onDelete }) {
  const style = typeStyle[event.type] ?? typeStyle.Pribadi
  return (
    <li className="group flex items-start gap-3 py-2.5">
      <span className="w-11 shrink-0 pt-0.5 text-sm tabular-nums text-ink-2">{event.time.replace(':', '.')}</span>
      <span className={cn('mt-2 size-2 shrink-0 rounded-full', style.dot)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{event.title}</p>
        <p className="flex items-center gap-2 text-[0.8125rem] text-ink-2">
          {event.type}
          {event.repeat !== 'none' && <span className="inline-flex items-center gap-1"><Repeat className="size-3" aria-hidden="true" />rutin</span>}
          {event.reminder !== 'none' && <span className="inline-flex items-center gap-1"><Bell className="size-3" aria-hidden="true" />pengingat</span>}
        </p>
      </div>
      <Menu items={[{ label: 'Hapus kegiatan', icon: Trash2, danger: true, onSelect: () => onDelete(event) }]} label={`Aksi untuk ${event.title}`} className="size-8 opacity-60 group-hover:opacity-100" />
    </li>
  )
}

export default function CalendarPage() {
  const toast = useToast()
  const confirm = useConfirm()
  const [view, setView] = useState('month')
  const [selected, setSelected] = useState(TODAY)
  const [cursor, setCursor] = useState(() => fromISO(`${TODAY.slice(0, 8)}01`))
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Kuliah', date: TODAY, time: '08:00', repeat: 'none', reminder: '60' })
  const [error, setError] = useState('')

  // Ambil kegiatan satu bulan sebelum sampai satu bulan sesudah bulan yang tampil.
  const range = {
    from: new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1).toISOString(),
    to: new Date(cursor.getFullYear(), cursor.getMonth() + 2, 1).toISOString(),
  }
  const resource = useResource('/calendar-events', range)
  const events = (resource.data?.data ?? []).map(eventFromApi)
  const eventsOn = (iso) => events.filter((e) => occursOn(e, iso)).toSorted((a, b) => a.time.localeCompare(b.time))

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = addDays(-weekdayIndex(first), first)
  const cells = Array.from({ length: 42 }, (_, i) => toISO(addDays(i, gridStart)))
  const weekStart = addDays(-weekdayIndex(fromISO(selected)), fromISO(selected))
  const weekDays = Array.from({ length: 7 }, (_, i) => toISO(addDays(i, weekStart)))

  const goTo = (iso) => {
    setSelected(iso)
    setCursor(fromISO(`${iso.slice(0, 8)}01`))
  }
  const shift = (n) => {
    if (view === 'month') setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1))
    else goTo(toISO(addDays(n * (view === 'week' ? 7 : 1), fromISO(selected))))
  }

  const remove = async (event) => {
    const ok = await confirm({
      title: 'Hapus kegiatan?',
      description: event.repeat !== 'none' ? `"${event.title}" adalah kegiatan rutin. Semua jadwal berulangnya ikut terhapus.` : `"${event.title}" akan dihapus dari kalender.`,
      confirmLabel: 'Hapus', tone: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/calendar-events/${event.id}`)
      resource.reload()
      toast.info('Kegiatan dihapus')
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Judul kegiatan wajib diisi.')
    setSaving(true)
    try {
      await api.post('/calendar-events', eventToApi({ ...form, title: form.title.trim() }))
      goTo(form.date)
      setOpen(false)
      setError('')
      setForm((f) => ({ ...f, title: '' }))
      resource.reload()
      toast('Kegiatan ditambahkan')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
    return undefined
  }
  const setField = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))
  const selectedEvents = eventsOn(selected)
  const title = view === 'month' ? formatMonth(cursor) : view === 'week' ? `${formatLong(weekDays[0])} – ${formatLong(weekDays[6])}` : formatLong(selected)

  const dayPanel = (
    <section aria-labelledby="day-title" className="rounded-panel border border-line bg-surface p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id="day-title" className="font-semibold capitalize">{selected === TODAY ? 'Hari ini' : formatLong(selected)}</h2>
        <Button size="sm" variant="ghost" onClick={() => { setForm((f) => ({ ...f, date: selected })); setOpen(true) }}><Plus aria-hidden="true" /> Tambah</Button>
      </div>
      {selectedEvents.length === 0 ? (
        <EmptyState compact illustration="calendar" title="Belum ada kegiatan" description="Hari ini masih lowong." />
      ) : (
        <ul className="divide-y divide-line">{selectedEvents.map((e) => <EventRow key={e.id} event={e} onDelete={remove} />)}</ul>
      )}
    </section>
  )

  return (
    <>
      <PageHeader
        title="Kalender"
        subtitle="Jadwal kelas, ujian, deadline, dan kegiatanmu dalam satu tampilan."
        action={<Button onClick={() => { setForm((f) => ({ ...f, date: selected })); setOpen(true) }}><Plus aria-hidden="true" /> Tambah kegiatan</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" aria-label="Sebelumnya" onClick={() => shift(-1)}><ChevronLeft aria-hidden="true" /></Button>
          <Button size="icon" variant="secondary" aria-label="Berikutnya" onClick={() => shift(1)}><ChevronRight aria-hidden="true" /></Button>
          <Button size="sm" variant="ghost" onClick={() => goTo(TODAY)}>Hari ini</Button>
          <h2 className="ml-1 text-lg font-semibold capitalize" aria-live="polite">{title}</h2>
        </div>
        <SegmentedControl label="Tampilan kalender" options={views} value={view} onChange={setView} />
      </div>

      {resource.error && (
        <p role="alert" className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Kegiatan belum bisa dimuat. <button type="button" className="font-semibold underline underline-offset-4" onClick={resource.reload}>Coba lagi</button>
        </p>
      )}

      {view === 'month' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-xs">
            <div className="grid grid-cols-7 border-b border-line bg-canvas/60 text-center text-xs font-medium text-ink-2" aria-hidden="true">
              {dayNames.map((d) => <div key={d} className="py-2.5">{d}</div>)}
            </div>
            <div className="grid grid-cols-7" role="group" aria-label={formatMonth(cursor)}>
              {cells.map((iso, i) => {
                const evs = eventsOn(iso)
                const inMonth = fromISO(iso).getMonth() === cursor.getMonth()
                const isSel = iso === selected
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={isSel}
                    aria-label={`${formatLong(iso)}, ${evs.length} kegiatan`}
                    onClick={() => setSelected(iso)}
                    className={cn(
                      'flex min-h-16 flex-col items-stretch gap-1 border-line p-1.5 text-left transition-colors sm:min-h-24 sm:p-2',
                      i % 7 !== 6 && 'border-r', i < 35 && 'border-b',
                      isSel ? 'bg-sage/50' : 'hover:bg-canvas',
                      !inMonth && 'bg-canvas/40',
                    )}
                  >
                    <span className={cn(
                      'grid size-7 place-items-center self-start rounded-full text-sm tabular-nums',
                      iso === TODAY ? 'bg-forest font-semibold text-surface' : inMonth ? 'text-ink' : 'text-muted',
                    )}>
                      {Number(iso.slice(8))}
                    </span>
                    {/* Desktop: judul singkat; mobile: titik berwarna. */}
                    <span className="hidden flex-col gap-0.5 sm:flex">
                      {evs.slice(0, 2).map((e) => (
                        <span key={e.id} className={cn('truncate rounded-r border-l-2 px-1.5 py-0.5 text-[0.6875rem] font-medium', (typeStyle[e.type] ?? typeStyle.Pribadi).chip)}>{e.title}</span>
                      ))}
                      {evs.length > 2 && <span className="px-1.5 text-[0.6875rem] text-ink-2">+{evs.length - 2} lagi</span>}
                    </span>
                    <span className="flex flex-wrap gap-0.5 sm:hidden">
                      {evs.slice(0, 3).map((e) => <span key={e.id} className={cn('size-1.5 rounded-full', (typeStyle[e.type] ?? typeStyle.Pribadi).dot)} />)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          {dayPanel}
        </div>
      )}

      {view === 'week' && (
        <div className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((iso) => {
            const evs = eventsOn(iso)
            return (
              <section key={iso} aria-label={formatLong(iso)} className={cn('min-h-40 bg-surface p-3', iso === TODAY && 'bg-sage/40')}>
                <button type="button" onClick={() => { setSelected(iso); setView('day') }} className="mb-2 flex items-baseline gap-1.5 rounded text-left">
                  <span className="text-xs capitalize text-ink-2">{shortDay.format(fromISO(iso))}</span>
                  <span className={cn('font-display text-xl tabular-nums', iso === TODAY && 'text-forest')}>{Number(iso.slice(8))}</span>
                </button>
                {evs.length === 0 ? <p className="text-xs text-muted">Kosong</p> : (
                  <ul className="space-y-1.5">
                    {evs.map((e) => (
                      <li key={e.id} className={cn('rounded-r border-l-2 px-2 py-1 text-xs', (typeStyle[e.type] ?? typeStyle.Pribadi).chip)}>
                        <span className="block font-semibold tabular-nums">{e.time.replace(':', '.')}</span>
                        <span className="block truncate">{e.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}

      {view === 'day' && <div className="max-w-2xl">{dayPanel}</div>}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah kegiatan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="event-form" loading={saving}>Simpan kegiatan</Button>
          </>
        }
      >
        <form id="event-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Judul" required value={form.title} onChange={setField('title')} error={error} maxLength={160} placeholder="mis. Kuliah Basis Data" autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Jenis" options={eventTypeOptions.map((t) => ({ value: t, label: t }))} value={form.type} onChange={setField('type')} />
            <Select label="Ulangi" options={repeatOptions} value={form.repeat} onChange={setField('repeat')} />
            <DatePicker label="Tanggal" value={form.date} onChange={setField('date')} />
            <TimePicker label="Jam mulai" value={form.time} onChange={setField('time')} />
          </div>
          <Select label="Pengingat" options={reminderOptions} value={form.reminder} onChange={setField('reminder')} hint="Pengingat muncul di halaman Notifikasi." />
        </form>
      </Modal>
    </>
  )
}
