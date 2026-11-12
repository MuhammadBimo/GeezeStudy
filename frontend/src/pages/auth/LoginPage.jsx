import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { makeProfile, nameFromEmail } from '@/lib/profile'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const enter = (profile) => {
    login(profile)
    toast(`Selamat datang, ${profile.name}!`)
  }

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Isi email atau nama (boleh apa saja).'
    if (!form.password) next.password = 'Isi password (boleh apa saja).'
    setErrors(next)
    if (Object.keys(next).length === 0) {
      enter(makeProfile({ name: nameFromEmail(form.email), email: form.email.trim() }))
    }
  }

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Lanjutkan belajarmu."
      footer={<>Belum punya akun? <Link to="/daftar" className="font-bold underline underline-offset-4">Daftar</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email atau nama" autoComplete="username" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Link to="/lupa-password" className="self-end text-sm font-bold underline underline-offset-4">Lupa password?</Link>
        <Button type="submit" className="w-full">Masuk</Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="neutral" onClick={() => enter(makeProfile({ name: 'Tamu' }))}>
            Coba tanpa akun
          </Button>
          <Button variant="secondary" onClick={() => enter(makeProfile({ name: 'Admin Demo', role: 'admin' }))}>
            <ShieldCheck className="size-4" aria-hidden="true" /> Coba sebagai Admin
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
