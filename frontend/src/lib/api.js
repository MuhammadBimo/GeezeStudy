import axios from 'axios'

// Cookie-based Sanctum SPA auth: credentials + XSRF handled by axios.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8010'}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

export const fetchCsrfCookie = () =>
  axios.get(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8010'}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
