import { useEffect, useState } from 'react'
import { MailCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const COOLDOWN_SECONDS = 30

export default function VerifyEmailPage() {
  const { user, updateProfile, logout } = useAuth()
  const toast = useToast()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const resend = () => {
    setCooldown(COOLDOWN_SECONDS)
    toast('Simulasi: email verifikasi dikirim ulang')
  }

  // Setelah emailVerified menjadi true, guard route otomatis melanjutkan ke onboarding.
  const verify = () => {
    updateProfile({ emailVerified: true })
    toast('Email terverifikasi')
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-pink-soft p-5">
      <Card tone="primary" className="w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full border-2 border-ink bg-mint shadow-brutal-sm">
          <MailCheck className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-extrabold">Cek emailmu</h1>
        <p className="mt-2 text-ink/80">
          Kami mengirim tautan verifikasi ke <strong className="break-all">{user.email}</strong>. Klik tautan itu untuk melanjutkan.
        </p>
        <p className="mt-2 rounded-brutal border-2 border-ink bg-yellow p-2 text-sm font-medium">
          Mode demo: tidak ada email yang dikirim. Gunakan tombol di bawah untuk melanjutkan.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={verify}>Saya sudah verifikasi (simulasi)</Button>
          <Button variant="neutral" onClick={resend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang email'}
          </Button>
          <button type="button" onClick={logout} className="text-sm font-bold underline underline-offset-4">
            Pakai akun lain
          </button>
        </div>
      </Card>
    </main>
  )
}
