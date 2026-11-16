import { api } from '@/lib/api'

// Kategori yang bisa dipilih Student. Pengunjung yang belum bisa masuk hanya memakai sebagian (guest: true).
export const categories = [
  { value: 'bug', label: 'Bug atau error', hint: 'Ada yang rusak atau muncul pesan galat.' },
  { value: 'login', label: 'Kendala login', hint: 'Tidak bisa masuk padahal email dan password benar.', guest: true },
  { value: 'account_recovery', label: 'Lupa akun atau email', hint: 'Lupa email yang dipakai atau tidak bisa membuka emailnya.', guest: true },
  { value: 'password', label: 'Lupa password', hint: 'Tautan reset tidak sampai atau tidak berfungsi.', guest: true },
  { value: 'feature', label: 'Kendala fitur', hint: 'Fitur tidak berjalan seperti yang diharapkan.' },
  { value: 'general', label: 'Pertanyaan umum', hint: 'Bertanya cara memakai GeezeStudy.', guest: true },
  { value: 'other', label: 'Lainnya', hint: 'Hal lain yang tidak masuk kategori di atas.' },
]
export const categoryLabel = Object.fromEntries(categories.map((c) => [c.value, c.label]))

export const statuses = [
  { value: 'pending', label: 'Pending', tone: 'warning' },
  { value: 'in_progress', label: 'In Progress', tone: 'info' },
  { value: 'waiting_user', label: 'Waiting for User', tone: 'sand' },
  { value: 'resolved', label: 'Resolved', tone: 'success' },
  { value: 'closed', label: 'Closed', tone: 'neutral' },
]
export const statusMeta = Object.fromEntries(statuses.map((s) => [s.value, s]))

export const ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf'
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024

/** Unduh lampiran lewat permintaan terautentikasi (berkas privat, tidak punya URL publik). */
export async function downloadAttachment(path, name) {
  const { data } = await api.get(path, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
