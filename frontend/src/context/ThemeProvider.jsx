import { useCallback, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { ThemeContext } from '@/context/theme-context'

const KEY = 'geezestudy.theme'
const COLORS = { light: '#f7f6f0', dark: '#151a17' }
const DURATION = 640

// preference: 'light' | 'dark' | 'system'. Pilihan disimpan di perangkat; "system" mengikuti pengaturan OS.
const readPreference = () => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}
const query = () => window.matchMedia('(prefers-color-scheme: dark)')

const paint = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', COLORS[theme])
}

// Titik asal animasi: tengah tombol yang sedang fokus/diklik, atau tengah layar.
function originPoint(origin) {
  if (origin) return origin
  const el = document.activeElement
  if (el && el !== document.body) {
    const r = el.getBoundingClientRect()
    if (r.width > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

export default function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference)
  const [systemDark, setSystemDark] = useState(() => query().matches)

  useEffect(() => {
    const mq = query()
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => { paint(resolved) }, [resolved])

  const setPreference = useCallback((next, origin) => {
    const nextResolved = next === 'system' ? (query().matches ? 'dark' : 'light') : next
    const commit = () => {
      flushSync(() => setPreferenceState(next))
      paint(nextResolved)
    }
    try {
      if (next === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, next)
    } catch { /* penyimpanan diblokir: pilihan tetap berlaku selama halaman terbuka */ }

    const root = document.documentElement
    const current = root.getAttribute('data-theme')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (current === nextResolved) { commit(); return }

    // Browser modern: lingkaran melebar dari tombol. Tanpa dukungan atau gerak dikurangi: tanpa lingkaran.
    if (!reduced && typeof document.startViewTransition === 'function') {
      const { x, y } = originPoint(origin)
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      const transition = document.startViewTransition(commit)
      transition.ready
        .then(() => root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: DURATION, easing: 'cubic-bezier(0.22, 0.8, 0.28, 1)', pseudoElement: '::view-transition-new(root)' },
        ))
        .catch(() => { /* transisi dibatalkan: tema tetap berganti */ })
      return
    }

    // Cadangan: warna berubah halus, bukan loncat.
    if (!reduced) {
      root.classList.add('theme-fade')
      setTimeout(() => root.classList.remove('theme-fade'), 320)
    }
    commit()
  }, [])

  const toggle = useCallback((origin) => setPreference(resolved === 'dark' ? 'light' : 'dark', origin), [resolved, setPreference])

  const value = useMemo(() => ({ preference, resolved, setPreference, toggle }), [preference, resolved, setPreference, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
