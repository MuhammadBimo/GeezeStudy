import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'

export default function ResetPasswordPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (form.password.length < 8) next.password = 'Password baru minimal 8 karakter.'
    if (form.confirm !== form.password) next.confirm = 'Konfirmasi harus sama dengan password baru.'
    setErrors(next)
    if (Object.keys(next).length === 0) {
      toast('Password diperbarui. Silakan masuk.')
      navigate('/masuk', { replace: true })
    }
  }

  return (
    <AuthLayout
      title="Atur ulang password"
      subtitle="Buat password baru untuk akunmu."
      footer={<Link to="/masuk" className="font-bold underline underline-offset-4">Kembali ke halaman masuk</Link>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Password baru" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Minimal 8 karakter." />
        <Input label="Ulangi password baru" type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" className="w-full">Simpan password</Button>
      </form>
    </AuthLayout>
  )
}
