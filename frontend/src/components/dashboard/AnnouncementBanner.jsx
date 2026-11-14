import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Megaphone, X } from 'lucide-react'

// Pengumuman dari Admin. Menutup hanya menyembunyikan di tampilan ini.
export default function AnnouncementBanner({ items }) {
  const [dismissed, setDismissed] = useState([])
  const visible = items.filter((a) => !dismissed.includes(a.id))

  return (
    <AnimatePresence initial={false}>
      {visible.map((a) => (
        <m.section
          key={a.id}
          aria-label="Pengumuman"
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6 flex items-start gap-3 overflow-hidden rounded-xl border border-sand bg-sand-soft px-4 py-3"
        >
          <Megaphone className="mt-0.5 size-4.5 shrink-0 text-[#6b5326]" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{a.title}</p>
            <p className="text-ink-2">{a.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed((d) => [...d, a.id])}
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
