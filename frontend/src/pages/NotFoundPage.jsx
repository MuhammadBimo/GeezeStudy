import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function NotFoundPage({ standalone = false }) {
  const content = (
    <Card tone="primary" className="mx-auto grid max-w-md place-items-center gap-3 p-8 text-center">
      <Compass className="size-12" aria-hidden="true" />
      <h1 className="font-display text-5xl font-semibold">404</h1>
      <p className="font-semibold">Halaman tidak ditemukan.</p>
      <p className="text-sm">Alamatnya mungkin salah atau halamannya sudah dipindah.</p>
      <Link
        to="/"
        className="mt-2 inline-flex min-h-11 items-center rounded-panel border border-line bg-forest px-5 py-2.5 font-semibold text-surface shadow-soft-sm transition-all hover:-translate-y-px hover:bg-forest-mid active:translate-y-px active:shadow-press motion-reduce:transition-none"
      >
        Kembali ke beranda
      </Link>
    </Card>
  )

  return standalone ? <main className="grid min-h-dvh place-items-center p-5">{content}</main> : content
}
