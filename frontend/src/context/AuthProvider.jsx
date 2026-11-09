import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from '@/context/auth-context'

// MODE DEMO: profil hanya disimpan di browser ini (localStorage). Tidak ada akun asli atau backend.
const KEY = 'geezestudy.demoUser'

const readSaved = () => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSaved)

  const login = useCallback((profile) => {
    setUser(profile)
    try {
      localStorage.setItem(KEY, JSON.stringify(profile))
    } catch {
      /* penyimpanan tidak tersedia: sesi hanya berlaku selama tab terbuka */
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* abaikan */
    }
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
