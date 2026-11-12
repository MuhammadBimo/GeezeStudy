import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AUTH_EXPIRED_EVENT, api, fetchCsrfCookie } from '@/lib/api'

// Autentikasi nyata: sesi hidup di cookie Sanctum, profil dimuat dari GET /api/user.
export default function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, serverDown: false })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await fetchCsrfCookie()
        const { data } = await api.get('/user')
        if (!cancelled) setState({ status: 'ready', user: data, serverDown: false })
      } catch (error) {
        if (!cancelled) setState({ status: 'ready', user: null, serverDown: !error.response })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Sesi berakhir saat memakai aplikasi: kembali ke halaman masuk.
  useEffect(() => {
    const expire = () => setState((s) => ({ ...s, user: null }))
    window.addEventListener(AUTH_EXPIRED_EVENT, expire)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expire)
  }, [])

  const setUser = useCallback((user) => setState({ status: 'ready', user, serverDown: false }), [])

  const login = useCallback(async (credentials) => {
    await fetchCsrfCookie()
    const { data } = await api.post('/login', credentials)
    setUser(data)
    return data
  }, [setUser])

  const register = useCallback(async (payload) => {
    await fetchCsrfCookie()
    const { data } = await api.post('/register', payload)
    setUser(data)
    return data
  }, [setUser])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } finally {
      // Hapus sisa data perangkat milik akun ini (mis. timer yang berjalan) agar tidak bocor ke akun berikutnya.
      try {
        localStorage.removeItem('geezestudy.timer')
      } catch {
        /* penyimpanan tidak tersedia */
      }
      setUser(null)
    }
  }, [setUser])

  const refresh = useCallback(async () => {
    const { data } = await api.get('/user')
    setUser(data)
    return data
  }, [setUser])

  const updateProfile = useCallback(async (patch) => {
    const { data } = await api.patch('/user', patch)
    setUser(data)
    return data
  }, [setUser])

  const value = useMemo(
    () => ({ ...state, login, register, logout, refresh, updateProfile, setUser }),
    [state, login, register, logout, refresh, updateProfile, setUser],
  )
  return <AuthContext value={value}>{children}</AuthContext>
}
