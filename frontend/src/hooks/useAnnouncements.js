import { useContext } from 'react'
import { AnnouncementsContext } from '@/context/announcements-context'

export function useAnnouncements() {
  const ctx = useContext(AnnouncementsContext)
  if (!ctx) throw new Error('useAnnouncements harus dipakai di dalam <AnnouncementsProvider>')
  return ctx
}
