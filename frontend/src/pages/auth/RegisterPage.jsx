import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { educationLevels, makeProfile } from '@/lib/profile'

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
    const email = form.email.trim()
    // Alur demo: kalau email diisi, lanjut ke verifikasi email lalu onboarding. Tanpa email, langsung onboarding.
    login(
      makeProfile({
        name,
        email,
        username: form.username.trim(),
        level: form.level,
        institution: form.institution.trim(),
        emailVerified: !email,
        onboarded: false,
      }),
    )
    toast(`Akun demo dibuat. Halo, ${name}!`)
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Cukup isi nama, sisanya bebas."
      footer={<>Sudah punya akun? <Link to="/masuk" className="font-bold underline underline-offset-4">Masuk</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Nama" required autoComplete="name" value={form.name} onChange={set('name')} error={error} />
        <Input label="Username (opsional)" autoComplete="username" value={form.username} onChange={set('username')} />
        <Input label="Email (opsional)" type="email" autoComplete="email" value={form.email} onChange={set('email')} hint="Kalau diisi, kamu akan melihat langkah verifikasi email." />
        <Input label="Password (opsional)" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        <Select label="Jenjang pendidikan" options={educationLevels} value={form.level} onChange={set('level')} />
        <Input label="Asal sekolah / kampus (opsional)" value={form.institution} onChange={set('institution')} />
        <Button type="submit" className="w-full">Daftar dan masuk</Button>
      </form>
    </AuthLayout>
  )
}
