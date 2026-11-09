import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const valid = /^\S+@\S+\.\S+$/.test(email)
    setError(valid ? '' : 'Masukkan email yang valid.')
    setSent(valid)
  }

  return (
    <AuthLayout
      title="Lupa password"
      subtitle="Masukkan emailmu dan kami kirim tautan untuk mengatur ulang."
      footer={<Link to="/masuk" className="font-bold underline underline-offset-4">Kembali ke halaman masuk</Link>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" className="w-full">Kirim tautan</Button>
        {sent && (
          <p role="status" className="rounded-brutal border-2 border-ink bg-yellow p-3 text-sm font-medium">
            Formulir valid. Pengiriman email belum tersambung ke backend pada tahap ini.
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
