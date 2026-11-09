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
