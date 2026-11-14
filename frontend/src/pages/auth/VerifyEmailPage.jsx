import { useEffect, useState } from 'react'
import { MailCheck } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'

const COOLDOWN_SECONDS = 60

export default function VerifyEmailPage() {
  const { user, refresh, logout } = useAuth()
  const toast = useToast()
  const [cooldown, setCooldown] = useState(0)
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const resend = async () => {
    setSending(true)
    try {
      await api.post('/email/verification-notification')
      setCooldown(COOLDOWN_SECONDS)
      toast.info('Email verifikasi dikirim ulang')
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setSending(false)
    }
  }

  // Setelah email_verified menjadi true, guard route otomatis melanjutkan.
  const check = async () => {
    setChecking(true)
    try {
      const fresh = await refresh()
      if (!fresh.email_verified) toast.warning('Email belum terverifikasi', { description: 'Klik tautan di emailmu dulu, lalu coba lagi.' })
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setChecking(false)
    }
  }

  return (
    <AuthLayout
      title="Verifikasi emailmu"
      subtitle="Satu langkah lagi sebelum mulai."
      footer={<button type="button" onClick={logout} className="font-semibold text-forest underline-offset-4 hover:underline">Pakai akun lain</button>}
    >
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage text-forest"><MailCheck className="size-5" aria-hidden="true" /></span>
        <p className="text-sm text-ink-2">
          Kami mengirim tautan verifikasi ke <strong className="break-all font-semibold text-ink">{user.email}</strong>. Buka email itu, klik tautannya, lalu kembali ke sini.
        </p>
      </div>
      {import.meta.env.DEV && (
        <p className="mt-3 text-xs text-muted">Mode pengembangan: email tidak benar-benar dikirim. Tautannya tercatat di <code className="font-mono">backend/storage/logs/laravel.log</code>.</p>
      )}
      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" onClick={check} loading={checking}>Saya sudah verifikasi</Button>
        <Button size="lg" variant="secondary" onClick={resend} disabled={cooldown > 0} loading={sending}>
          {cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang email'}
        </Button>
      </div>
    </AuthLayout>
  )
}
