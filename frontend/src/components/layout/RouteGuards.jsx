import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Halaman aplikasi hanya untuk yang sudah "masuk" (mode demo).
export function RequireAuth() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/masuk" replace />
}

// Halaman masuk/daftar tidak perlu dibuka lagi kalau sudah masuk.
export function GuestOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <Outlet />
}
