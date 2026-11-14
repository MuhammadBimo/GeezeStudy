import { RotateCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCards, SkeletonList } from '@/components/ui/Skeleton'
import { errorMessage } from '@/lib/api'

// Membungkus hasil useResource: kerangka yang meniru bentuk konten saat memuat, galat dengan tombol coba lagi.
export default function AsyncView({ resource, children, skeleton = 'list', rows = 4 }) {
  const { data, error, loading, reload } = resource

  if (error) {
    return (
      <div role="alert" className="rounded-panel border border-line bg-surface">
        <EmptyState
          illustration="error"
          title="Data belum bisa dimuat"
          description={errorMessage(error)}
          action={<Button variant="secondary" onClick={reload}><RotateCw aria-hidden="true" /> Coba lagi</Button>}
        />
      </div>
    )
  }

  if (loading || data === null) {
    return (
      <div role="status" aria-label="Memuat data">
        {skeleton === 'cards' ? <SkeletonCards count={rows} /> : <SkeletonList rows={rows} />}
      </div>
    )
  }

  return children(data)
}
