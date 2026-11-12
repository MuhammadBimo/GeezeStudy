import { useCallback, useMemo, useState } from 'react'
import { AnnouncementsContext } from '@/context/announcements-context'

// DATA SEMENTARA (mock): disimpan di memori saja agar Admin dan Student dalam satu sesi melihat hal yang sama.
const seed = [
  {
    id: 1,
    title: 'Selamat datang di GeezeStudy versi demo',
    body: 'Semua data di sini contoh dan tidak disimpan ke server. Silakan coba semua fitur.',
    target: 'all',
    createdAt: 'Hari ini',
  },
]

export default function AnnouncementsProvider({ children }) {
  const [items, setItems] = useState(seed)

  const add = useCallback((a) => setItems((prev) => [{ ...a, id: Date.now(), createdAt: 'Baru saja' }, ...prev]), [])
  const remove = useCallback((id) => setItems((prev) => prev.filter((x) => x.id !== id)), [])

  const value = useMemo(() => ({ items, add, remove }), [items, add, remove])
  return <AnnouncementsContext value={value}>{children}</AnnouncementsContext>
}
