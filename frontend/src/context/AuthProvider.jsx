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

const save = (profile) => {
  try {
    if (profile) localStorage.setItem(KEY, JSON.stringify(profile))
    else localStorage.removeItem(KEY)
  } catch {
    /* penyimpanan tidak tersedia: sesi hanya berlaku selama tab terbuka */
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSaved)

  const login = useCallback((profile) => {
    setUser(profile)
    save(profile)
  }, [])

  const updateProfile = useCallback((patch) => {
    setUser((cur) => {
      const next = { ...cur, ...patch }
      save(next)
      return next
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    save(null)
  }, [])

  const value = useMemo(() => ({ user, login, updateProfile, logout }), [user, login, updateProfile, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
