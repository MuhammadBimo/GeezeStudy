import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import { useResource } from '@/hooks/useResource'

const dateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Riwayat pengumuman sistem: semua yang pernah terbit, termasuk yang sudah ditutup di Beranda.
export default function AnnouncementsPage() {
  const [page, setPage] = useState(1)
  const resource = useResource('/announcements', { page })

  return (
    <>
      <PageHeader title="Pengumuman" subtitle="Informasi resmi dari tim GeezeStudy: pemeliharaan, gangguan layanan, dan fitur baru." />
      <AsyncView resource={resource}>
        {(data) => (data.data.length === 0 ? (
          <div className="rounded-panel border border-line bg-surface">
            <EmptyState illustration="inbox" title="Belum ada pengumuman" description="Informasi resmi dari tim GeezeStudy akan muncul di sini." />
          </div>
        ) : (
          <>
            <ol className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs">
              {data.data.map((a) => (
                <li key={a.id} className="flex gap-4 px-4 py-5 sm:px-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand text-sand-ink"><Megaphone className="size-4.5" aria-hidden="true" /></span>
                  <article className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <time dateTime={a.published_at}>{dateFmt.format(new Date(a.published_at))}</time>
                      {!a.dismissed && <Badge tone="sand">Baru</Badge>}
                    </p>
                    <h2 className="mt-1 font-semibold">{a.title}</h2>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-2">{a.body}</p>
                  </article>
                </li>
              ))}
            </ol>
            {data.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <p>Halaman {data.current_page} dari {data.last_page}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={data.current_page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
                  <Button size="sm" variant="secondary" disabled={data.current_page >= data.last_page} onClick={() => setPage(page + 1)}>Berikutnya</Button>
                </div>
              </div>
            )}
          </>
        ))}
      </AsyncView>
    </>
  )
}
