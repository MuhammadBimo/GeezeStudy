import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import { BADGES_EVENT } from '@/lib/badges'

const POLL_MS = 60_000

/**
 * Angka lencana menu menurut kunci item: '/notifikasi' dan '/bantuan' untuk Student; 'admin-helpdesk' (grup),
 * 'admin-helpdesk-all' dan 'admin-helpdesk-recovery' (submenu) untuk Admin.
 * Diambil saat pindah halaman, tiap menit, saat tab kembali aktif, dan saat ada permintaan refresh.
 * Gagal mengambil tidak mengganggu: lencana tetap pada angka terakhir.
 */
export function useNavBadges(isAdmin) {
  const { pathname } = useLocation()
  const [badges, setBadges] = useState({ notifications: 0, helpdesk: 0, recovery: 0 })
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(() => {
    api.get('/badges').then((res) => { setBadges(res.data); setLoaded(true) }).catch(() => {})
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

  const map = isAdmin
    ? { 'admin-helpdesk': badges.helpdesk, 'admin-helpdesk-all': badges.helpdesk, 'admin-helpdesk-recovery': badges.recovery }
    : { '/notifikasi': badges.notifications, '/bantuan': badges.helpdesk }

  // `loaded` = angka pertama sudah diterima; dipakai agar pop-up tidak muncul untuk angka awal.
  return { badges: map, loaded }
}
