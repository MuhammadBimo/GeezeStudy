import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    if (!email.trim()) {
      setError('Isi email akunmu.')
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

  return (
    <AuthLayout
      title="Lupa password"
      subtitle="Masukkan emailmu dan kami kirim tautan untuk mengatur ulang."
      footer={<Link to="/masuk" className="font-semibold underline underline-offset-4">Kembali ke halaman masuk</Link>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" className="w-full" loading={loading}>Kirim tautan</Button>
      </form>

      {sent && (
        <p role="status" className="mt-4 rounded-panel border border-line bg-moss p-3 text-sm font-medium">
          Jika email itu terdaftar, tautan untuk mengatur ulang password sudah dikirim. Cek kotak masuk dan folder spam.
        </p>
      )}
    </AuthLayout>
  )
}
