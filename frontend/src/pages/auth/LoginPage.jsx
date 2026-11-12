import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { errorMessage, fieldErrors } from '@/lib/api'

// Akun contoh dari seeder backend. Panel ini hanya tampil saat pengembangan (npm run dev), bukan di build produksi.
const devAccounts = [
  { label: 'Admin', email: 'admin@geezestudy.test' },
  { label: 'SD', email: 'sd@geezestudy.test' },
  { label: 'SMP', email: 'smp@geezestudy.test' },
  { label: 'SMA', email: 'sma@geezestudy.test' },
  { label: 'Mahasiswa', email: 'mahasiswa@geezestudy.test' },
]

export default function LoginPage() {
  const { login, serverDown } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Isi email kamu.'
    if (!form.password) next.password = 'Isi password kamu.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const user = await login({ email: form.email.trim(), password: form.password })
      toast(`Selamat datang, ${user.name}!`)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Lanjutkan belajarmu."
      footer={<>Belum punya akun? <Link to="/daftar" className="font-semibold underline underline-offset-4">Daftar</Link></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {(errors.form || serverDown) && (
          <p role="alert" className="rounded-panel border border-danger/40 bg-danger/10 p-3 text-sm font-medium text-danger">
            {errors.form ?? 'Server belum bisa dihubungi. Pastikan backend sudah berjalan.'}
          </p>
        )}
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Link to="/lupa-password" className="self-end text-sm font-semibold underline underline-offset-4">Lupa password?</Link>
        <Button type="submit" className="w-full" loading={loading}>Masuk</Button>
      </form>

      {import.meta.env.DEV && (
        <section aria-label="Akun uji (pengembangan)" className="mt-6 rounded-panel bg-canvas p-4 shadow-inset">
          <p className="mb-1 text-sm font-semibold">Akun uji lokal</p>
          <p className="mb-3 text-xs text-ink/80">Klik untuk mengisi form. Password semuanya <code className="font-mono">password123</code>.</p>
          <div className="flex flex-wrap gap-2">
            {devAccounts.map((a) => (
              <Button key={a.email} size="sm" variant="secondary" onClick={() => setForm({ email: a.email, password: 'password123' })}>
                {a.label}
              </Button>
            ))}
          </div>
        </section>
      )}
    </AuthLayout>
  )
}
