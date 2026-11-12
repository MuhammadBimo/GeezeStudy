import { useEffect, useState } from 'react'
import { MailCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
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
      toast('Email verifikasi dikirim ulang')
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setSending(false)
    }
  }

  // Setelah email_verified menjadi true, guard route otomatis melanjutkan ke onboarding.
  const check = async () => {
    setChecking(true)
    try {
      const fresh = await refresh()
      if (!fresh.email_verified) toast('Email belum terverifikasi. Klik tautan di emailmu dulu.', 'error')
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-forest-tint p-5">
      <Card tone="primary" className="w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full border border-line bg-moss shadow-soft-sm">
          <MailCheck className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-semibold">Cek emailmu</h1>
        <p className="mt-2 text-ink/80">
          Kami mengirim tautan verifikasi ke <strong className="break-all">{user.email}</strong>. Klik tautan itu, lalu kembali ke sini.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={check} loading={checking}>Saya sudah verifikasi</Button>
          <Button variant="neutral" onClick={resend} disabled={cooldown > 0} loading={sending}>
            {cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang email'}
          </Button>
          <button type="button" onClick={logout} className="text-sm font-semibold underline underline-offset-4">
            Pakai akun lain
          </button>
        </div>
      </Card>
    </main>
  )
}
