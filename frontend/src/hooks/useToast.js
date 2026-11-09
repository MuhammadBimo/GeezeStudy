import { useContext } from 'react'
import { ToastContext } from '@/context/toast-context'

// Pemakaian: const toast = useToast(); toast('Tugas disimpan')
export function useToast() {
  const push = useContext(ToastContext)
  if (!push) throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  return push
}
