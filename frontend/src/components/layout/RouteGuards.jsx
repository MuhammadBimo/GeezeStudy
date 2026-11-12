import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Urutan alur: masuk -> verifikasi email -> onboarding -> aplikasi (mode demo).
export function RequireAuth() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (!user) return <Navigate to="/masuk" replace />
  if (!user.emailVerified) {
    return pathname === '/verifikasi-email' ? <Outlet /> : <Navigate to="/verifikasi-email" replace />
  }
  if (!user.onboarded) {
    return pathname === '/mulai' ? <Outlet /> : <Navigate to="/mulai" replace />
  }
  if (pathname === '/verifikasi-email' || pathname === '/mulai') return <Navigate to="/" replace />
  return <Outlet />
}

// Halaman masuk/daftar tidak perlu dibuka lagi kalau sudah masuk.
export function GuestOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <Outlet />
}

// Panel admin hanya untuk role Admin.
export function RequireAdmin() {
  const { user } = useAuth()
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}
