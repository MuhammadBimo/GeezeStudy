import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const levels = [
  { value: 'sd', label: 'SD' },
  { value: 'smp', label: 'SMP' },
  { value: 'sma', label: 'SMA / SMK' },
  { value: 'college', label: 'Mahasiswa' },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', level: 'college', institution: '' })
  const [error, setError] = useState('')

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Isi namamu dulu (boleh nama panggilan).')
      return
    }
    login({ name, username: form.username.trim(), email: form.email.trim(), level: form.level, institution: form.institution.trim() })
    toast(`Akun demo dibuat. Halo, ${name}!`)
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Cukup isi nama, sisanya bebas."
      footer={<>Sudah punya akun? <Link to="/masuk" className="font-bold underline underline-offset-4">Masuk</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Nama" autoComplete="name" value={form.name} onChange={set('name')} error={error} />
        <Input label="Username (opsional)" autoComplete="username" value={form.username} onChange={set('username')} />
        <Input label="Email (opsional)" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
        <Input label="Password (opsional)" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        <Select label="Jenjang pendidikan" options={levels} value={form.level} onChange={set('level')} />
        <Input label="Asal sekolah / kampus (opsional)" value={form.institution} onChange={set('institution')} />
        <Button type="submit" className="w-full">Daftar dan masuk</Button>
      </form>
    </AuthLayout>
  )
}
