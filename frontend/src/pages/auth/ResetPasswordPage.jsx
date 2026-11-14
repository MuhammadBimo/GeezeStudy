import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fetchCsrfCookie, fieldErrors } from '@/lib/api'

export default function ResetPasswordPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const email = params.get('email')
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))
  const back = <Link to="/masuk" className="font-semibold text-forest underline-offset-4 hover:underline">Kembali ke halaman masuk</Link>

  if (!token || !email) {
    return (
      <AuthLayout title="Tautan tidak lengkap" subtitle="Buka tautan dari email pemulihan, atau minta tautan baru." footer={back}>
        <Button size="lg" className="w-full" onClick={() => navigate('/lupa-password')}>Minta tautan baru</Button>
      </AuthLayout>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (form.password.length < 8) next.password = 'Minimal 8 karakter.'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Gunakan kombinasi huruf dan angka.'
    if (form.confirm !== form.password) next.confirm = 'Belum sama dengan password baru.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await fetchCsrfCookie()
      await api.post('/reset-password', { token, email, password: form.password, password_confirmation: form.confirm })
      toast('Password diperbarui. Silakan masuk.')
      navigate('/masuk', { replace: true })
    } catch (err) {
      const fields = fieldErrors(err)
      setErrors(Object.keys(fields).length ? { ...fields, form: fields.email } : { form: errorMessage(err) })
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Buat password baru" subtitle={`Untuk akun ${email}.`} footer={back}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {errors.form && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {errors.form}
          </p>
        )}
        <PasswordInput label="Password baru" required showStrength autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter, kombinasi huruf dan angka." />
        <PasswordInput label="Ulangi password baru" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" size="lg" className="w-full" loading={loading}>Simpan password</Button>
      </form>
    </AuthLayout>
  )
}
