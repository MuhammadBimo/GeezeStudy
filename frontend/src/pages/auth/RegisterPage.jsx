import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Mail, UserRound } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input, { PasswordInput } from '@/components/ui/Input'
import SegmentedControl from '@/components/ui/SegmentedControl'
import TurnstileWidget from '@/components/ui/TurnstileWidget'

const TURNSTILE_ENABLED = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { errorMessage, fieldErrors } from '@/lib/api'
import { educationLevels, institutionField } from '@/lib/profile'

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', education_level: 'sma', institution: '' })
  const [turnstileToken, setTurnstileToken] = useState('')
  const [captchaReset, setCaptchaReset] = useState(0)
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
    if (TURNSTILE_ENABLED && !turnstileToken) next.turnstile_token = 'Selesaikan verifikasi captcha terlebih dahulu.'
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const user = await register({ ...form, name: form.name.trim(), email: form.email.trim(), institution: form.institution.trim() || null, turnstile_token: turnstileToken })
      toast(`Akun dibuat. Halo, ${user.name}`)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setCaptchaReset((k) => k + 1)
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

        <Input label="Nama" required icon={UserRound} autoComplete="name" placeholder="Nama lengkap" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" required type="email" icon={Mail} autoComplete="email" placeholder="nama@email.com" value={form.email} onChange={set('email')} error={errors.email} hint="Kami kirim tautan verifikasi ke email ini." />
        <PasswordInput label="Password" required showStrength autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter, kombinasi huruf dan angka." />
        <PasswordInput label="Ulangi password" required autoComplete="new-password" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} />

        <div>
          <p id="jenjang-label" className="mb-1.5 text-sm font-medium">Jenjang pendidikan</p>
          <SegmentedControl label="Jenjang pendidikan" options={educationLevels.map((l) => ({ ...l, label: l.value === 'sma' ? 'SMA' : l.label }))} value={form.education_level} onChange={(v) => setForm((f) => ({ ...f, education_level: v }))} className="w-full [&>button]:flex-1" />
        </div>
        <Input label={`${inst.label} (opsional)`} autoComplete="organization" placeholder={inst.placeholder} value={form.institution} onChange={set('institution')} error={errors.institution} />

        <TurnstileWidget
          onVerify={(token) => {
            setTurnstileToken(token)
            if (token) setErrors((cur) => ({ ...cur, turnstile_token: undefined }))
          }}
          resetKey={captchaReset}
          error={errors.turnstile_token}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>{loading ? 'Membuat akun...' : 'Buat akun'}</Button>
      </form>
    </AuthLayout>
  )
}
