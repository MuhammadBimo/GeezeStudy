import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { errorMessage, fieldErrors } from '@/lib/api'
import { educationLevels } from '@/lib/profile'

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', education_level: 'college', institution: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Isi namamu.'
    if (!form.email.trim()) next.email = 'Isi email yang aktif.'
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter, berisi huruf dan angka.'
    if (form.password !== form.password_confirmation) next.password_confirmation = 'Konfirmasi harus sama dengan password.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const user = await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        institution: form.institution.trim() || null,
      })
      toast(`Akun dibuat. Halo, ${user.name}!`)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Gratis, dan siap dipakai dalam satu menit."
      footer={<>Sudah punya akun? <Link to="/masuk" className="font-semibold underline underline-offset-4">Masuk</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {errors.form && <p role="alert" className="rounded-panel border border-danger/40 bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form}</p>}
        <Input label="Nama" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} hint="Kami kirim tautan verifikasi ke email ini." />
        <Input label="Password" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter, berisi huruf dan angka." />
        <Input label="Ulangi password" type="password" required autoComplete="new-password" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} />
        <Select label="Jenjang pendidikan" options={educationLevels} value={form.education_level} onChange={set('education_level')} />
        <Input label="Asal sekolah / kampus (opsional)" autoComplete="organization" value={form.institution} onChange={set('institution')} error={errors.institution} />
        <Button type="submit" className="w-full" loading={loading}>Daftar</Button>
      </form>
    </AuthLayout>
  )
}
