import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'
import { ToastContext } from '@/context/toast-context'

const DURATION_MS = 2800

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const push = useCallback((message) => {
    const id = nextId.current++
    setToasts((t) => [...t.slice(-2), { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), DURATION_MS)
  }, [])

  return (
    <ToastContext value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <m.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-2 rounded-brutal border-2 border-ink bg-mint px-4 py-2.5 font-bold shadow-brutal"
            >
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
              {t.message}
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  )
}
