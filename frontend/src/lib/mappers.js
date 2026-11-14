// Penerjemah antara bentuk data API (Inggris, snake_case) dan bentuk yang dipakai tampilan.
import { toISO } from '@/lib/date'

const STATUS_FROM_API = { todo: 'todo', in_progress: 'progress', completed: 'done' }
const STATUS_TO_API = { todo: 'todo', progress: 'in_progress', done: 'completed' }
const PRIORITY_FROM_API = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }
const PRIORITY_TO_API = { Tinggi: 'high', Sedang: 'medium', Rendah: 'low' }

export const taskFromApi = (t) => ({
  id: t.id,
  title: t.title,
  course: t.course ?? '',
  due: t.due_at ? toISO(new Date(t.due_at)) : '',
  dueAt: t.due_at,
  priority: PRIORITY_FROM_API[t.priority] ?? 'Sedang',
  status: STATUS_FROM_API[t.status] ?? 'todo',
  description: t.description ?? '',
  attachment: t.attachment_name ?? '',
})

export const taskToApi = (form) => ({
  title: form.title,
  course: form.course || null,
  description: form.description || null,
  priority: PRIORITY_TO_API[form.priority] ?? 'medium',
  // Deadline berlaku sampai akhir hari di zona waktu perangkat.
  due_at: form.due ? new Date(`${form.due}T23:59:00`).toISOString() : null,
  attachment_name: form.attachment || null,
})

export const statusToApi = (status) => STATUS_TO_API[status]

// Kegiatan kalender
const EVENT_TYPE_FROM_API = {
  class: 'Kuliah', deadline: 'Deadline', exam: 'Ujian', presentation: 'Presentasi', meeting: 'Rapat', personal: 'Pribadi',
}
const EVENT_TYPE_TO_API = Object.fromEntries(Object.entries(EVENT_TYPE_FROM_API).map(([k, v]) => [v, k]))

const pad = (n) => String(n).padStart(2, '0')

export const eventFromApi = (e) => {
  const start = new Date(e.starts_at)
  return {
    id: e.id,
    title: e.title,
    type: EVENT_TYPE_FROM_API[e.type] ?? 'Pribadi',
    date: toISO(start),
    time: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    repeat: e.repeat ?? 'none',
    reminder: e.reminder_minutes ? String(e.reminder_minutes) : 'none',
  }
}

export const eventToApi = (form) => ({
  title: form.title,
  type: EVENT_TYPE_TO_API[form.type] ?? 'personal',
  starts_at: new Date(`${form.date}T${form.time || '00:00'}:00`).toISOString(),
  repeat: form.repeat,
  reminder_minutes: form.reminder === 'none' ? null : Number(form.reminder),
})

export const eventTypeOptions = Object.values(EVENT_TYPE_FROM_API)

// Label jam pendek untuk daftar agenda ("13:00" bila hari ini, selain itu "Kamis, 08:00").
const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
export const agendaTime = (iso) => {
  const d = new Date(iso)
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return toISO(d) === toISO(new Date()) ? clock : `${dayFmt.format(d)}, ${clock}`
}

export const agendaFromApi = (e) => ({
  id: e.id,
  title: e.title,
  time: agendaTime(e.starts_at),
  type: EVENT_TYPE_FROM_API[e.type] ?? 'Pribadi',
})

// Waktu relatif singkat untuk notifikasi dan riwayat.
const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
export const relativeTime = (iso) => {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(hours / 24), 'day')
}

export const clockTime = (iso) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

export const dayTime = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
