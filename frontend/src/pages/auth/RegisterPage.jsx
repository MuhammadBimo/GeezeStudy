import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const levels = [
  { value: 'sd', label: 'SD' },
  { value: 'smp', label: 'SMP' },
  { value: 'sma', label: 'SMA / SMK' },
  { value: 'college', label: 'Mahasiswa' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', level: 'college', institution: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Nama wajib diisi.'
    if (!/^[a-z0-9._]{3,20}$/i.test(form.username)) next.username = '3–20 karakter: huruf, angka, titik, atau garis bawah.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Masukkan email yang valid.'
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter.'
    setErrors(next)
    setSent(Object.keys(next).length === 0)
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Gratis, dan siap dipakai dalam satu menit."
      footer={<>Sudah punya akun? <Link to="/masuk" className="font-bold underline underline-offset-4">Masuk</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Nama lengkap" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Username" autoComplete="username" value={form.username} onChange={set('username')} error={errors.username} hint="Dipakai temanmu untuk mencarimu." />
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Select label="Jenjang pendidikan" options={levels} value={form.level} onChange={set('level')} />
        <Input label="Institusi (opsional)" value={form.institution} onChange={set('institution')} />
        <Button type="submit" className="w-full">Daftar</Button>
        {sent && (
          <p role="status" className="rounded-brutal border-2 border-ink bg-yellow p-3 text-sm font-medium">
            Formulir valid. Pendaftaran belum tersambung ke backend pada tahap ini.
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
