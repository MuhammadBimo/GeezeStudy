import { useState } from 'react'
import Button from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { api, errorMessage, fieldErrors } from '@/lib/api'

/**
 * Ganti password oleh pemilik akun: password saat ini, password baru, ulangi.
 * Dipakai di Pengaturan dan di halaman wajib ganti password (setelah Admin memberi password sementara).
 */
export default function ChangePasswordForm({ currentLabel = 'Password saat ini', submitLabel = 'Ganti password', onDone }) {
  const { setUser } = useAuth()
  const [form, setForm] = useState({ current: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.current) next.current_password = 'Isi password saat ini.'
    if (form.password.length < 8) next.password = 'Minimal 8 karakter.'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Gunakan kombinasi huruf dan angka.'
    else if (form.password === form.current) next.password = 'Password baru harus berbeda dari password saat ini.'
    if (form.confirm !== form.password) next.password_confirmation = 'Belum sama dengan password baru.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    try {
      const { data } = await api.put('/user/password', { current_password: form.current, password: form.password, password_confirmation: form.confirm })
      setUser(data)
      setForm({ current: '', password: '', confirm: '' })
      onDone?.(data)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { current_password: errorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
      <PasswordInput label={currentLabel} required autoComplete="current-password" value={form.current} onChange={set('current')} error={errors.current_password} />
      <PasswordInput label="Password baru" required showStrength autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter, kombinasi huruf dan angka." />
      <PasswordInput label="Ulangi password baru" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.password_confirmation} />
      <div><Button type="submit" loading={saving}>{submitLabel}</Button></div>
    </form>
  )
}
