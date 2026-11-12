import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8010'

// Sanctum SPA (cookie): kredensial dikirim otomatis, token XSRF dibaca dari cookie oleh axios.
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
})

export const fetchCsrfCookie = () => axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true })

export const AUTH_EXPIRED_EVENT = 'geezestudy:auth-expired'

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    // Token CSRF kedaluwarsa: ambil yang baru lalu ulangi sekali.
    if (response?.status === 419 && config && !config._csrfRetried) {
      config._csrfRetried = true
      await fetchCsrfCookie()
      return api(config)
    }

    // Sesi habis di tengah pemakaian: beri tahu AuthProvider (kecuali saat memeriksa sesi / login).
    if (response?.status === 401 && !/\/(user|login)$/.test(config?.url ?? '')) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }

    throw error
  },
)

/** Pesan galat yang ramah pengguna dari galat axios. */
export function errorMessage(error, fallback = 'Terjadi kesalahan. Coba lagi.') {
  if (!error?.response) return 'Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.'
  const { status, data } = error.response
  if (status === 422 && data?.errors) return Object.values(data.errors)[0]?.[0] ?? fallback
  if (status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
  return data?.message ?? fallback
}

/** Galat per kolom dari respons validasi 422: { email: 'pesan', ... } */
export function fieldErrors(error) {
  const errors = error?.response?.status === 422 ? error.response.data?.errors : null
  if (!errors) return {}
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]]))
}
