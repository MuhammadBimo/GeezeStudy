import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'

export default function ForgotPasswordPage() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Isi email (boleh apa saja).')
      return
    }
    setError('')
    setSent(true)
    toast('Simulasi: tautan pemulihan dikirim')
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
      </form>

      {sent && (
        <p role="status" className="mt-4 rounded-brutal border-2 border-ink bg-mint p-3 text-sm font-medium">
          Tidak ada email yang benar-benar dikirim di mode demo.{' '}
          <Link to="/reset-password" className="font-bold underline underline-offset-4">Buka halaman atur ulang password</Link>
        </p>
      )}
    </AuthLayout>
  )
}
