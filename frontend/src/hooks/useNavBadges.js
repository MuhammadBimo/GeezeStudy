import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import { BADGES_EVENT } from '@/lib/badges'

const POLL_MS = 60_000

/**
 * Angka lencana menu: { '/notifikasi': n, '/bantuan': n } untuk Student, { '/admin/helpdesk': n } untuk Admin.
 * Diambil saat pindah halaman, tiap menit, saat tab kembali aktif, dan saat ada permintaan refresh.
 * Gagal mengambil tidak mengganggu: lencana tetap pada angka terakhir.
 */
export function useNavBadges(isAdmin) {
  const { pathname } = useLocation()
  const [badges, setBadges] = useState({ notifications: 0, helpdesk: 0 })

  const load = useCallback(() => {
    api.get('/badges').then((res) => setBadges(res.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load, pathname])
  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) load() }, POLL_MS)
    const onVisible = () => { if (!document.hidden) load() }
    window.addEventListener(BADGES_EVENT, load)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      window.removeEventListener(BADGES_EVENT, load)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  return isAdmin
    ? { '/admin/helpdesk': badges.helpdesk }
    : { '/notifikasi': badges.notifications, '/bantuan': badges.helpdesk }
}
