import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Memakai elemen <dialog> native: focus trap, Esc, dan aksesibilitas sudah ditangani browser.
export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-panel border border-line bg-surface p-0 shadow-soft-lg "
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="grid size-9 place-items-center rounded-full text-ink/80 transition-all hover:bg-canvas hover:text-ink active:scale-90 active:shadow-inset"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
