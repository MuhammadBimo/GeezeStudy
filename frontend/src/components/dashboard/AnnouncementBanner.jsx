import { useState } from 'react'
import { Megaphone, X } from 'lucide-react'
import Card from '@/components/ui/Card'
import { useAnnouncements } from '@/hooks/useAnnouncements'

// Pengumuman dari Admin. Menutup hanya menyembunyikan di sesi ini.
export default function AnnouncementBanner() {
  const { items } = useAnnouncements()
  const [dismissed, setDismissed] = useState([])
  const visible = items.filter((a) => !dismissed.includes(a.id))

  if (visible.length === 0) return null

  return (
    <section aria-label="Pengumuman" className="flex flex-col gap-3">
      {visible.map((a) => (
        <Card key={a.id} color="bg-sand-deep" className="flex items-start gap-3 p-4">
          <Megaphone className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-medium leading-tight">{a.title}</h2>
            <p className="text-sm">{a.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed((d) => [...d, a.id])}
            aria-label={`Tutup pengumuman: ${a.title}`}
            className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface transition-transform active:scale-90"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </Card>
      ))}
    </section>
  )
}
