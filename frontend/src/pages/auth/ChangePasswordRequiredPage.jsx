import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ChangePasswordForm from '@/components/account/ChangePasswordForm'
import AuthLayout from '@/components/layout/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

// Muncul setelah masuk dengan password sementara dari Admin. Fitur aplikasi baru terbuka setelah password diganti.
export default function ChangePasswordRequiredPage() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Buat password baru"
      subtitle="Kamu masuk memakai password sementara dari Admin. Buat password milikmu sendiri sebelum melanjutkan."
      footer={<button type="button" onClick={logout} className="font-semibold text-accent underline-offset-4 hover:underline">Keluar</button>}
    >
      <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-sage/60 px-4 py-3 text-sm text-ink-2">
        <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-accent" aria-hidden="true" />
        <span>Setelah ini, password sementara tidak berlaku lagi dan hanya kamu yang tahu password akun <strong className="text-ink">{user.email}</strong>.</span>
      </p>
      <ChangePasswordForm
        currentLabel="Password sementara dari Admin"
        submitLabel="Simpan dan lanjutkan"
        onDone={(u) => {
          toast.success('Password baru tersimpan')
          navigate(u.role === 'admin' ? '/admin' : '/', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
