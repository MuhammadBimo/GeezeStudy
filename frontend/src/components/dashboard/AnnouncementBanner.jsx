import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { Megaphone, X } from 'lucide-react'
import { api } from '@/lib/api'

/**
 * Pengumuman sistem dari Admin (terpisah dari notifikasi aktivitas). Yang terbaru di atas; pengumuman baru
 * tidak menimpa yang lama. Menutup disimpan di server, jadi tidak muncul lagi; semuanya tetap ada di riwayat.
 */
export default function AnnouncementBanner({ items }) {
  const [dismissed, setDismissed] = useState([])
  const visible = items.filter((a) => !dismissed.includes(a.id))

  const dismiss = (a) => {
    setDismissed((d) => [...d, a.id])
    // Gagal tersimpan tidak perlu mengganggu pengguna: paling buruk banner muncul lagi di kunjungan berikutnya.
    api.post(`/announcements/${a.id}/dismiss`).catch(() => {})
  }

  return (
    <AnimatePresence initial={false}>
      {visible.map((a, i) => (
        <m.section
          key={a.id}
          aria-label="Pengumuman"
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.22 }}
          className="mb-6 flex items-start gap-3 overflow-hidden rounded-xl border border-sand bg-sand-soft px-4 py-3"
        >
          <Megaphone className="mt-0.5 size-4.5 shrink-0 text-sand-ink" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{a.title}</p>
            <p className="text-ink-2">{a.body}</p>
            {i === visible.length - 1 && (
              <Link to="/pengumuman" className="mt-1 inline-block text-xs font-semibold text-sand-ink underline-offset-4 hover:underline">Lihat semua pengumuman</Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(a)}
            aria-label={`Tutup pengumuman: ${a.title}`}
            className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </m.section>
      ))}
    </AnimatePresence>
  )
}
