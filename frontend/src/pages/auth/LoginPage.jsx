import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Mail } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input, { PasswordInput } from '@/components/ui/Input'
import TurnstileWidget from '@/components/ui/TurnstileWidget'

const TURNSTILE_ENABLED = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { errorMessage, fieldErrors } from '@/lib/api'

export default function LoginPage() {
  const { login, serverDown } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [turnstileToken, setTurnstileToken] = useState('')
  const [captchaReset, setCaptchaReset] = useState(0)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Isi email akunmu.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Format email belum benar.'
    if (!form.password) next.password = 'Isi password akunmu.'
    if (TURNSTILE_ENABLED && !turnstileToken) next.turnstile_token = 'Selesaikan verifikasi captcha terlebih dahulu.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const user = await login({ email: form.email.trim(), password: form.password, remember: form.remember, turnstile_token: turnstileToken })
      toast(`Selamat datang, ${user.name}`)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setCaptchaReset((k) => k + 1)
      setLoading(false)
    }
  }

  const formError = errors.form ?? (serverDown ? 'Server belum bisa dihubungi. Pastikan backend sudah berjalan.' : null)

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan belajarmu."
      footer={<>Belum punya akun? <Link to="/daftar" className="font-semibold text-accent underline-offset-4 hover:underline">Buat akun</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {formError}
          </p>
        )}
        <Input label="Email" type="email" icon={Mail} autoComplete="email" placeholder="nama@email.com" value={form.email} onChange={set('email')} error={errors.email} />
        <div>
          <PasswordInput label="Password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
          <div className="mt-3 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" checked={form.remember} onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))} className="size-4 rounded accent-forest" />
              Ingat saya
            </label>
            <Link to="/lupa-password" className="text-sm font-medium text-accent underline-offset-4 hover:underline">Lupa password?</Link>
          </div>
        </div>
        <TurnstileWidget
          onVerify={(token) => {
            setTurnstileToken(token)
            if (token) setErrors((cur) => ({ ...cur, turnstile_token: undefined }))
          }}
          resetKey={captchaReset}
          error={errors.turnstile_token}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>{loading ? 'Memeriksa...' : 'Masuk'}</Button>
      </form>

      <nav aria-label="Bantuan akun" className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-sm">
        <Link to="/bantuan-akun?kategori=account_recovery" className="font-medium text-accent underline-offset-4 hover:underline">Lupa email atau tidak bisa mengakses akun?</Link>
        <Link to="/bantuan-akun" className="font-medium text-accent underline-offset-4 hover:underline">Hubungi Helpdesk</Link>
      </nav>

    </AuthLayout>
  )
}
