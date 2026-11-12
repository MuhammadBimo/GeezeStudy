import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'

function Splash() {
  return (
    <div role="status" aria-label="Memeriksa sesi" className="grid min-h-dvh place-items-center">
      <div className="flex w-64 flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

// Urutan alur: masuk -> verifikasi email -> onboarding -> aplikasi.
export function RequireAuth() {
  const { user, status } = useAuth()
  const { pathname } = useLocation()

  if (status === 'loading') return <Splash />
  if (!user) return <Navigate to="/masuk" replace />
  if (!user.email_verified) {
    return pathname === '/verifikasi-email' ? <Outlet /> : <Navigate to="/verifikasi-email" replace />
  }
  // Admin tidak perlu onboarding Student.
  if (!user.onboarded && user.role !== 'admin') {
    return pathname === '/mulai' ? <Outlet /> : <Navigate to="/mulai" replace />
  }
  if (pathname === '/verifikasi-email' || pathname === '/mulai') return <Navigate to="/" replace />
  return <Outlet />
}

// Halaman masuk/daftar tidak perlu dibuka lagi kalau sudah masuk.
export function GuestOnly() {
  const { user, status } = useAuth()
  if (status === 'loading') return <Splash />
  return user ? <Navigate to="/" replace /> : <Outlet />
}

// Panel admin hanya untuk role Admin (server tetap memeriksa ulang di setiap permintaan).
export function RequireAdmin() {
  const { user } = useAuth()
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}
