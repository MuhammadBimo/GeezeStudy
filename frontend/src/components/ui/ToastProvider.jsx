import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'
import { ToastContext } from '@/context/toast-context'
import { cn } from '@/lib/cn'

const MAX = 4
let nextId = 0
const DURATION = { success: 4000, info: 5000, warning: 6000, error: 7000 }
const kinds = {
  success: { icon: CheckCircle2, color: 'text-success', soft: 'bg-success-soft', bar: 'bg-success' },
  info: { icon: Info, color: 'text-info', soft: 'bg-info-soft', bar: 'bg-info' },
  warning: { icon: AlertTriangle, color: 'text-warning', soft: 'bg-warning-soft', bar: 'bg-warning' },
  error: { icon: XCircle, color: 'text-danger', soft: 'bg-danger-soft', bar: 'bg-danger' },
  loading: { icon: Loader2, color: 'text-accent', soft: 'bg-sage', bar: '' },
}
const ease = [0.22, 0.8, 0.28, 1]

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
 *   toast.success('Misi selesai', { description, points: 20 })   // tampilan hadiah: +20 Points besar
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
        className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col items-stretch gap-2 transition-[bottom] duration-200 ease-out sm:inset-x-auto sm:bottom-[calc(1.25rem+var(--upload-tray-offset,0px))] sm:right-5 sm:top-auto sm:w-[22rem] sm:flex-col-reverse"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const meta = kinds[t.kind] ?? kinds.info
            const Icon = meta.icon
            const duration = t.kind === 'loading' ? null : t.duration ?? DURATION[t.kind]
            const reward = t.points > 0 && t.kind === 'success'
            return (
              <m.div
                key={t.id}
                layout
                role={t.kind === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 28, scale: 0.98, transition: { duration: 0.18, ease } }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={cn(
                  'toast pointer-events-auto relative overflow-hidden rounded-2xl border border-line bg-raised shadow-soft-lg',
                  reward && 'notif-sheen',
                )}
              >
                <div className={cn('flex gap-3 pr-2', reward ? 'items-stretch p-2.5' : 'items-start p-3')}>
                  {reward ? (
                    // Hadiah: angka Points jadi pusat perhatian, di blok hijau tua seperti panel ringkasan.
                    <m.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 460, damping: 20, delay: 0.08 }}
                      className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-panel px-3.5 py-2 text-on-panel"
                    >
                      <span className="font-display text-[1.75rem] leading-none tabular-nums">+{t.points}</span>
                      <span className="mt-1 text-[0.6875rem] font-medium text-on-panel/75">Points</span>
                    </m.div>
                  ) : (
                    <m.span
                      key={`${t.kind}-${t.version}`}
                      initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 18, delay: 0.06 }}
                      className={cn('grid size-9 shrink-0 place-items-center rounded-full', meta.soft)}
                    >
                      <Icon className={cn('size-[1.125rem]', meta.color, t.kind === 'loading' && 'animate-spin')} aria-hidden="true" />
                    </m.span>
                  )}
                  <div className={cn('min-w-0 flex-1', reward ? 'self-center py-1' : 'pt-1')}>
                    <p className="text-sm font-semibold leading-snug text-ink">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-2">{t.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Tutup notifikasi"
                    className="grid size-7 shrink-0 place-items-center self-start rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
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
                    className={cn('toast-progress absolute inset-x-3 bottom-0 h-[2px] rounded-full opacity-60', reward ? 'bg-accent' : meta.bar)}
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
