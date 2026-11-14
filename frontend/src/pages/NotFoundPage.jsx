import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export default function NotFoundPage({ standalone = false }) {
  const content = (
    <div className="mx-auto max-w-md rounded-panel border border-line bg-surface">
      <EmptyState
        illustration="search"
        title="Halaman tidak ditemukan"
        description="Alamatnya mungkin salah ketik atau halamannya sudah dipindah."
        action={
          <Link to="/" className="inline-flex h-11 items-center gap-2 rounded-control bg-forest px-4.5 font-semibold text-surface shadow-soft-sm transition-[background-color,transform] hover:bg-forest-mid active:scale-[0.98]">
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke beranda
          </Link>
        }
      />
      <h1 className="sr-only">404</h1>
    </div>
  )

  if (!standalone) return content
  return <main className="grid min-h-dvh place-items-center p-5">{content}</main>
}
