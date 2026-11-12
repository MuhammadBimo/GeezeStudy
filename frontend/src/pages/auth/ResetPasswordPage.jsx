import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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

  if (!token || !email) {
    return (
      <AuthLayout
        title="Tautan tidak lengkap"
        subtitle="Buka tautan dari email pemulihan, atau minta tautan baru."
        footer={<Link to="/masuk" className="font-semibold underline underline-offset-4">Kembali ke halaman masuk</Link>}
      >
        <Link to="/lupa-password" className="font-semibold underline underline-offset-4">Minta tautan baru</Link>
      </AuthLayout>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (form.password.length < 8) next.password = 'Password baru minimal 8 karakter, berisi huruf dan angka.'
    if (form.confirm !== form.password) next.confirm = 'Konfirmasi harus sama dengan password baru.'
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
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(err) })
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Atur ulang password"
      subtitle={`Buat password baru untuk ${email}.`}
      footer={<Link to="/masuk" className="font-semibold underline underline-offset-4">Kembali ke halaman masuk</Link>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {(errors.form || errors.email) && <p role="alert" className="rounded-panel border border-danger/40 bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form ?? errors.email}</p>}
        <Input label="Password baru" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter, berisi huruf dan angka." />
        <Input label="Ulangi password baru" type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" className="w-full" loading={loading}>Simpan password</Button>
      </form>
    </AuthLayout>
  )
}
