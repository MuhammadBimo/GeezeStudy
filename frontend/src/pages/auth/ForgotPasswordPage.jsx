import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck, Mail } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api, errorMessage, fetchCsrfCookie } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Isi email akunmu dengan format yang benar.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await fetchCsrfCookie()
      await api.post('/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const back = (
    <Link to="/masuk" className="inline-flex items-center gap-1.5 font-semibold text-forest underline-offset-4 hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke halaman masuk
    </Link>
  )

  if (sent) {
    return (
      <AuthLayout title="Cek emailmu" subtitle={`Jika ${email.trim()} terdaftar, tautan untuk mengatur ulang password sudah dikirim.`} footer={back}>
        <div role="status" className="flex items-start gap-3 rounded-xl border border-sage-deep bg-sage p-4 text-sm text-forest">
          <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>Tautan berlaku 60 menit. Tidak ada di kotak masuk? Cek folder spam atau <button type="button" onClick={() => setSent(false)} className="font-semibold underline underline-offset-4">kirim ulang</button>.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Lupa password" subtitle="Masukkan email akunmu. Kami kirim tautan untuk membuat password baru." footer={back}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Input label="Email" type="email" icon={Mail} autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" size="lg" className="w-full" loading={loading}>Kirim tautan</Button>
      </form>
    </AuthLayout>
  )
}
