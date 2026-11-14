import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

const sizes = { sm: 'sm:max-w-[26rem]', md: 'sm:max-w-[32rem]', lg: 'sm:max-w-[40rem]' }

/**
 * Modal di atas <dialog> native (focus trap, Esc, aksesibilitas dari browser).
 * Struktur: header (judul + deskripsi + tutup), isi yang bisa digulir, footer aksi.
 * Di layar kecil tampil sebagai bottom sheet. Animasi keluar diputar sebelum dialog ditutup.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const ref = useRef(null)
  const titleId = useId()
  const descId = useId()
  // Simpan isi terakhir agar tetap terlihat selama animasi keluar.
  const [cached, setCached] = useState({ children, footer, title, description })
  if (open && (cached.children !== children || cached.footer !== footer || cached.title !== title || cached.description !== description)) {
    setCached({ children, footer, title, description })
  }
  const view = open ? { children, footer, title, description } : cached

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return undefined
    if (open && !dialog.open) {
      dialog.removeAttribute('data-closing')
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.setAttribute('data-closing', '')
      const t = setTimeout(() => {
        dialog.close()
        dialog.removeAttribute('data-closing')
      }, 160)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      aria-describedby={view.description ? descId : undefined}
      className={cn(
        'w-full max-w-none overflow-visible p-0 text-ink',
        'max-sm:m-0 max-sm:mt-auto max-sm:max-h-[92dvh]',
        'sm:m-auto sm:w-[calc(100%-2rem)]',
        sizes[size],
      )}
    >
      <div className="flex max-h-[92dvh] flex-col rounded-t-2xl border border-line bg-surface shadow-soft-lg sm:max-h-[86dvh] sm:rounded-2xl">
        <header className="flex items-start gap-4 px-5 pb-3 pt-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold">{view.title}</h2>
            {view.description && <p id={descId} className="mt-1 text-sm text-ink-2">{view.description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink active:scale-95"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </header>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{view.children}</div>
        {view.footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-line bg-canvas/60 px-5 py-3.5 sm:flex-row sm:justify-end sm:rounded-b-2xl sm:px-6 [&>button]:max-sm:w-full">
            {view.footer}
          </footer>
        )}
      </div>
    </dialog>
  )
}
