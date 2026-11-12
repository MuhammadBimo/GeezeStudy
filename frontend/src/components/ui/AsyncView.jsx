import { AlertTriangle, RotateCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { errorMessage } from '@/lib/api'

// Membungkus hasil useResource: kerangka saat memuat, pesan + tombol coba lagi saat gagal.
export default function AsyncView({ resource, children, rows = 3 }) {
  const { data, error, loading, reload } = resource

  if (error) {
    return (
      <div role="alert" className="grid place-items-center gap-3 rounded-panel border border-line bg-surface p-8 text-center shadow-soft-sm">
        <AlertTriangle className="size-8 text-danger" aria-hidden="true" />
        <p className="font-semibold">Data belum bisa dimuat</p>
        <p className="max-w-sm text-sm text-ink/80">{errorMessage(error)}</p>
        <Button variant="neutral" onClick={reload}>
          <RotateCw className="size-4" aria-hidden="true" /> Coba lagi
        </Button>
      </div>
    )
  }

  if (loading || data === null) {
    return (
      <div role="status" aria-label="Memuat data" className="flex flex-col gap-4">
        {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
    )
  }

  return children(data)
}
