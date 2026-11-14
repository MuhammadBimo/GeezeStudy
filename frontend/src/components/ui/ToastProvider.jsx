import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'
import { ToastContext } from '@/context/toast-context'
import { cn } from '@/lib/cn'

const MAX = 4
let nextId = 0
const DURATION = { success: 4000, info: 5000, warning: 6000, error: 7000 }
const kinds = {
  success: { icon: CheckCircle2, color: 'text-success', bar: 'bg-success' },
  info: { icon: Info, color: 'text-info', bar: 'bg-info' },
  warning: { icon: AlertTriangle, color: 'text-warning', bar: 'bg-warning' },
  error: { icon: XCircle, color: 'text-danger', bar: 'bg-danger' },
  loading: { icon: Loader2, color: 'text-forest', bar: '' },
}

// Dibuat di luar komponen: fungsi toast() sekaligus objek dengan metode tambahan.
function createToastApi(add, update, dismiss) {
  const fn = (title, kind = 'success', opts = {}) => add({ kind, title, ...opts })
  for (const k of ['success', 'error', 'warning', 'info']) fn[k] = (title, opts = {}) => add({ kind: k, title, ...opts })
  fn.loading = (title, opts = {}) => add({ kind: 'loading', title, ...opts })
  fn.update = update
  fn.dismiss = dismiss
  fn.promise = async (promise, { loading, success, error }) => {
    const id = fn.loading(loading)
    try {
      const result = await promise
      update(id, { kind: 'success', title: typeof success === 'function' ? success(result) : success })
      return result
    } catch (err) {
      update(id, { kind: 'error', title: typeof error === 'function' ? error(err) : error })
      throw err
    }
  }
  return fn
}

/**
 * API:
 *   toast('Tersimpan')                  // sukses (kompatibel dengan pemakaian lama)
 *   toast('Gagal', 'error')             // jenis: success | error | warning | info
 *   toast.info(judul, { description })
 *   const id = toast.loading('Menyimpan...'); toast.update(id, { kind: 'success', title: 'Selesai' })
 *   await toast.promise(promise, { loading, success, error })
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const add = useCallback((t) => {
    const id = nextId++
    setToasts((list) => [...list.slice(-(MAX - 1)), { id, version: 0, ...t }])
    return id
  }, [])

  const update = useCallback((id, patch) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, ...patch, version: t.version + 1 } : t)))
  }, [])

  const api = useMemo(() => createToastApi(add, update, dismiss), [add, update, dismiss])

  return (
    <ToastContext value={api}>
      {children}
      <section
        aria-label="Notifikasi"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:top-auto sm:w-[22rem] sm:flex-col-reverse"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const meta = kinds[t.kind] ?? kinds.info
            const Icon = meta.icon
            const duration = t.kind === 'loading' ? null : t.duration ?? DURATION[t.kind]
            return (
              <m.div
                key={t.id}
                layout
                role={t.kind === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, x: 32, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, transition: { duration: 0.16 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="toast pointer-events-auto relative overflow-hidden rounded-xl border border-line bg-surface shadow-soft-lg"
              >
                <div className="flex items-start gap-3 py-3 pl-3.5 pr-2">
                  <Icon className={cn('mt-0.5 size-5 shrink-0', meta.color, t.kind === 'loading' && 'animate-spin')} aria-hidden="true" />
                  <div className="min-w-0 flex-1 pt-px">
                    <p className="text-sm font-semibold text-ink">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-[0.8125rem] text-ink-2">{t.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Tutup notifikasi"
                    className="grid size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                {duration && (
                  <span
                    key={t.version}
                    aria-hidden="true"
                    onAnimationEnd={() => dismiss(t.id)}
                    style={{ animationDuration: `${duration}ms`, '--toast-duration': `${duration}ms` }}
                    className={cn('toast-progress absolute inset-x-0 bottom-0 h-0.5 opacity-70', meta.bar)}
                  />
                )}
              </m.div>
            )
          })}
        </AnimatePresence>
      </section>
    </ToastContext>
  )
}
