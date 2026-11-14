import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Mail } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input, { PasswordInput } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { errorMessage, fieldErrors } from '@/lib/api'

// Akun demo dari seeder backend. Hanya tampil saat pengembangan (npm run dev), tidak ikut build produksi.
const demoAccounts = [
  { name: 'Dina', level: 'SD', email: 'sd@geezestudy.test' },
  { name: 'Raka', level: 'SMP', email: 'smp@geezestudy.test' },
  { name: 'Salsa', level: 'SMA', email: 'sma@geezestudy.test' },
  { name: 'Bimo', level: 'Mahasiswa', email: 'mahasiswa@geezestudy.test' },
  { name: 'Admin', level: 'Admin', email: 'admin@geezestudy.test' },
]

export default function LoginPage() {
  const { login, serverDown } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Isi email akunmu.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Format email belum benar.'
    if (!form.password) next.password = 'Isi password akunmu.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const user = await login({ email: form.email.trim(), password: form.password, remember: form.remember })
      toast(`Selamat datang, ${user.name}`)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setLoading(false)
    }
  }

  const formError = errors.form ?? (serverDown ? 'Server belum bisa dihubungi. Pastikan backend sudah berjalan.' : null)

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan belajarmu."
      footer={<>Belum punya akun? <Link to="/daftar" className="font-semibold text-forest underline-offset-4 hover:underline">Buat akun</Link></>}
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
            <Link to="/lupa-password" className="text-sm font-medium text-forest underline-offset-4 hover:underline">Lupa password?</Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>{loading ? 'Memeriksa...' : 'Masuk'}</Button>
      </form>

      {import.meta.env.DEV && (
        <section aria-labelledby="demo-title" className="mt-8 border-t border-line pt-6">
          <div className="flex items-baseline justify-between">
            <h2 id="demo-title" className="text-sm font-semibold">Akun demo</h2>
            <span className="text-xs text-ink-2">Password: <code className="font-mono">password123</code></span>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {demoAccounts.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => { setForm({ email: a.email, password: 'password123', remember: true }); setErrors({}) }}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-canvas"
                >
                  <Avatar name={a.name} size="xs" />
                  <span className="flex-1 text-sm font-medium">{a.name}</span>
                  <span className="text-xs text-ink-2">{a.level}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Klik salah satu untuk mengisi form. Panel ini hanya muncul di mode pengembangan.</p>
        </section>
      )}
    </AuthLayout>
  )
}
