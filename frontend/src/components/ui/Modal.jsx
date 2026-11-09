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
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-brutal border-2 border-ink bg-surface p-0 shadow-brutal-lg backdrop:bg-ink/60"
    >
      <div className="flex items-center justify-between border-b-2 border-ink bg-yellow px-5 py-3">
        <h2 id="modal-title" className="text-xl font-extrabold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="grid size-8 place-items-center rounded-brutal border-2 border-ink bg-surface"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
