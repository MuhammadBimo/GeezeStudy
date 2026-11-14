import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Mail, UserRound } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import AvatarPicker from '@/components/profile/AvatarPicker'
import Button from '@/components/ui/Button'
import Input, { PasswordInput } from '@/components/ui/Input'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { educationLevels, institutionField } from '@/lib/profile'

export default function RegisterPage() {
  const { register, setUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', education_level: 'sma', institution: '' })
  const [photo, setPhoto] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))
  const inst = institutionField[form.education_level]

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Isi nama lengkap atau nama panggilanmu.'
    if (!form.email.trim()) next.email = 'Isi email yang aktif.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Format email belum benar.'
    if (form.password.length < 8) next.password = 'Minimal 8 karakter.'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Gunakan kombinasi huruf dan angka.'
    if (!form.password_confirmation) next.password_confirmation = 'Ulangi password.'
    else if (form.password !== form.password_confirmation) next.password_confirmation = 'Belum sama dengan password di atas.'
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const user = await register({ ...form, name: form.name.trim(), email: form.email.trim(), institution: form.institution.trim() || null })
      if (photo) {
        // Foto diunggah setelah akun dibuat; kalau gagal, akun tetap jadi dan foto bisa ditambah di Pengaturan.
        try {
          const body = new FormData()
          body.append('avatar', photo)
          const { data } = await api.post('/user/avatar', body)
          setUser(data)
        } catch {
          toast.warning('Akun dibuat, tetapi foto belum tersimpan', { description: 'Tambahkan lagi dari halaman Pengaturan.' })
        }
      }
      toast(`Akun dibuat. Halo, ${user.name}`)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Gratis. Cukup beberapa data, sisanya bisa diatur nanti."
      footer={<>Sudah punya akun? <Link to="/masuk" className="font-semibold text-forest underline-offset-4 hover:underline">Masuk</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {errors.form && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {errors.form}
          </p>
        )}

        <AvatarPicker name={form.name} file={photo} onChange={setPhoto} />

        <Input label="Nama" required icon={UserRound} autoComplete="name" placeholder="Nama lengkap" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" required type="email" icon={Mail} autoComplete="email" placeholder="nama@email.com" value={form.email} onChange={set('email')} error={errors.email} hint="Kami kirim tautan verifikasi ke email ini." />
        <PasswordInput label="Password" required showStrength autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter, kombinasi huruf dan angka." />
        <PasswordInput label="Ulangi password" required autoComplete="new-password" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} />

        <div>
          <p id="jenjang-label" className="mb-1.5 text-sm font-medium">Jenjang pendidikan</p>
          <SegmentedControl label="Jenjang pendidikan" options={educationLevels.map((l) => ({ ...l, label: l.value === 'sma' ? 'SMA' : l.label }))} value={form.education_level} onChange={(v) => setForm((f) => ({ ...f, education_level: v }))} className="w-full [&>button]:flex-1" />
        </div>
        <Input label={`${inst.label} (opsional)`} autoComplete="organization" placeholder={inst.placeholder} value={form.institution} onChange={set('institution')} error={errors.institution} />

        <Button type="submit" size="lg" className="w-full" loading={loading}>{loading ? 'Membuat akun...' : 'Buat akun'}</Button>
      </form>
    </AuthLayout>
  )
}
