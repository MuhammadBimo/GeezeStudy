// Helper tanggal berbasis zona waktu lokal. Format ISO = "YYYY-MM-DD".
const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISO = (iso) => new Date(`${iso}T00:00:00`)

export const addDays = (n, base = new Date()) => {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export const TODAY = toISO(new Date())
export const isoIn = (n) => toISO(addDays(n))

const shortFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const longFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })

export const formatShort = (iso) => shortFmt.format(fromISO(iso))
export const formatLong = (iso) => longFmt.format(fromISO(iso))
export const formatMonth = (d) => monthFmt.format(d)

// Indeks hari dengan Senin = 0.
export const weekdayIndex = (d) => (d.getDay() + 6) % 7

const clockFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })
const weekdayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
const dayMonthFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })

/** Label tenggat yang mudah dibaca + nada warnanya (danger/warning/neutral). */
export function dueInfo(dueAt, done = false) {
  if (!dueAt) return { text: 'Tanpa deadline', tone: 'neutral' }
  const d = new Date(dueAt)
  const diffDays = Math.round((fromISO(toISO(d)) - fromISO(TODAY)) / 86_400_000)
  const clock = clockFmt.format(d).replace(':', '.')
  if (!done && d < new Date()) return { text: `Terlambat · ${dayMonthFmt.format(d)}`, tone: 'danger' }
  if (diffDays === 0) return { text: `Hari ini, ${clock}`, tone: done ? 'neutral' : 'warning' }
  if (diffDays === 1) return { text: `Besok, ${clock}`, tone: 'neutral' }
  if (diffDays > 1 && diffDays < 7) return { text: `${weekdayFmt.format(d)}, ${clock}`, tone: 'neutral' }
  return { text: dayMonthFmt.format(d), tone: 'neutral' }
}

/** Sapaan sesuai jam lokal. */
export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}
