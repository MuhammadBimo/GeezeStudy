import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, KeyRound } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import TicketForm from '@/components/helpdesk/TicketForm'
import { categories } from '@/lib/helpdesk'

/** Bantuan untuk orang yang belum bisa masuk. Tidak butuh akun; balasan admin dikirim ke email kontak. */
export default function HelpPage() {
  const [params] = useSearchParams()
  const initial = categories.find((c) => c.guest && c.value === params.get('kategori'))?.value
  const [sent, setSent] = useState(null)

  return (
    <AuthLayout
      title="Bantuan akun"
      subtitle="Tidak bisa masuk? Ceritakan kendalamu, admin akan membalas lewat email."
      footer={<>Sudah ingat akunmu? <Link to="/masuk" className="font-semibold text-accent underline-offset-4 hover:underline">Masuk</Link></>}
    >
      {sent ? (
        <div role="status" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
          <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Permintaanmu sudah terkirim</h2>
            <p className="mt-1 text-sm text-ink-2">Nomor tiket: <strong className="text-ink">{sent.code}</strong>. Simpan nomor ini. Balasan admin dikirim ke email kontak yang kamu isi, jadi cek juga folder spam.</p>
          </div>
          <Link to="/masuk" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">Kembali ke halaman masuk</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Link to="/lupa-password" className="flex items-start gap-3 rounded-xl bg-sage/60 p-4 text-sm transition-colors hover:bg-sage">
            <KeyRound className="mt-0.5 size-4.5 shrink-0 text-accent" aria-hidden="true" />
            <span><strong className="block font-semibold">Hanya lupa password?</strong><span className="text-ink-2">Atur ulang sendiri lewat email, tidak perlu menunggu admin.</span></span>
          </Link>
          <TicketForm guest initialCategory={initial} onDone={setSent} />
          <p className="text-xs text-muted">Untuk pelajar SD dan SMP, admin bisa meminta bantuan orang tua, wali, atau sekolah untuk memastikan akun itu milikmu.</p>
        </div>
      )}
    </AuthLayout>
  )
}
