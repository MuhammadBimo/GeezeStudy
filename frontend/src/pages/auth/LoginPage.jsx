import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Masukkan email yang valid.'
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter.'
    setErrors(next)
    setSent(Object.keys(next).length === 0)
  }

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Lanjutkan belajarmu."
      footer={<>Belum punya akun? <Link to="/daftar" className="font-bold underline underline-offset-4">Daftar</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Link to="/lupa-password" className="self-end text-sm font-bold underline underline-offset-4">Lupa password?</Link>
        <Button type="submit" className="w-full">Masuk</Button>
        {sent && (
          <p role="status" className="rounded-brutal border-2 border-ink bg-yellow p-3 text-sm font-medium">
            Formulir valid. Login belum tersambung ke backend pada tahap ini.
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
