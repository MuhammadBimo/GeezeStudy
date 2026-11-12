import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function NotFoundPage({ standalone = false }) {
  const content = (
    <Card tone="primary" color="bg-yellow" className="mx-auto grid max-w-md place-items-center gap-3 p-8 text-center">
      <Compass className="size-12" aria-hidden="true" />
      <h1 className="font-display text-5xl font-extrabold">404</h1>
      <p className="font-bold">Halaman tidak ditemukan.</p>
      <p className="text-sm">Alamatnya mungkin salah atau halamannya sudah dipindah.</p>
      <Link
        to="/"
        className="mt-2 rounded-brutal border-2 border-ink bg-pink px-5 py-2.5 font-bold shadow-brutal transition-all hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none"
      >
        Kembali ke beranda
      </Link>
    </Card>
  )

  return standalone ? <main className="grid min-h-dvh place-items-center p-5">{content}</main> : content
}
