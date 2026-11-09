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

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Isi email (boleh apa saja).')
      return
    }
    setError('')
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
    </AuthLayout>
  )
}
