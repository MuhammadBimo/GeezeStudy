import { useCallback, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import { portalTarget, useFloating } from '@/hooks/useFloating'
import { cn } from '@/lib/cn'

/**
 * Menu aksi. Dibuka lewat tombol (⋯) atau klik kanan pada elemen yang dibungkus ContextMenu.
 * items: [{ label, icon, onSelect, danger, disabled }] — `'-'` menjadi pemisah.
 */
function MenuPanel({ id, items, open, anchorRef, point, onClose, target }) {
  const panelRef = useRef(null)
  const style = useFloating({ open, anchorRef, panelRef, point, onClose, matchWidth: false, align: 'end' })
  const [active, setActive] = useState(0)
  const actionable = items.map((it, i) => (it !== '-' && !it.disabled ? i : null)).filter((i) => i !== null)

  const onKey = (e) => {
    const pos = actionable.indexOf(active)
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(actionable[Math.min(actionable.length - 1, pos + 1)]) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(actionable[Math.max(0, pos - 1)]) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); items[active]?.onSelect?.(); onClose(true) }
    else if (e.key === 'Tab') onClose()
  }

  if (!open || !target) return null
  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="menu"
      tabIndex={-1}
      style={style}
      onKeyDown={onKey}
      className="float-panel z-[70] min-w-48 rounded-xl border border-line bg-surface p-1.5 shadow-soft-lg outline-none"
    >
      {items.map((it, i) =>
        it === '-' ? (
          <div key={`sep-${i}`} role="separator" className="my-1 h-px bg-line" />
        ) : (
          <button
            key={it.label}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            data-active={i === active || undefined}
            onMouseEnter={() => setActive(i)}
            onClick={() => { it.onSelect?.(); onClose(true) }}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-40',
              'data-[active]:bg-canvas',
              it.danger ? 'text-danger data-[active]:bg-danger-soft' : 'text-ink',
            )}
          >
            {it.icon && <it.icon className="size-4 shrink-0 opacity-80" aria-hidden="true" />}
            {it.label}
          </button>
        ),
      )}
    </div>,
    target,
  )
}

export default function Menu({ items, label = 'Aksi lainnya', className, icon: Icon = MoreHorizontal, children }) {
  const id = useId()
  const anchorRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState(null)
  const close = useCallback((refocus) => {
    setOpen(false)
    if (refocus) anchorRef.current?.focus()
  }, [])

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => { setTarget(portalTarget(anchorRef.current)); setOpen((o) => !o); requestAnimationFrame(() => document.getElementById(id)?.focus()) }}
        className={cn('grid size-9 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink aria-expanded:bg-ink/5 aria-expanded:text-ink', className)}
      >
        {children ?? <Icon className="size-4" aria-hidden="true" />}
      </button>
      <MenuPanel id={id} items={items} open={open} anchorRef={anchorRef} onClose={close} target={target} />
    </>
  )
}

/** Membungkus elemen agar klik kanan membuka menu yang sama di posisi kursor. */
export function ContextMenu({ items, children, className, as: Tag = 'div', ...props }) {
  const id = useId()
  const wrapRef = useRef(null)
  const [point, setPoint] = useState(null)
  const [target, setTarget] = useState(null)
  const close = useCallback(() => setPoint(null), [])

  return (
    <Tag
      ref={wrapRef}
      className={className}
      onContextMenu={(e) => {
        e.preventDefault()
        setTarget(portalTarget(wrapRef.current))
        setPoint({ x: e.clientX, y: e.clientY })
        requestAnimationFrame(() => document.getElementById(id)?.focus())
      }}
      {...props}
    >
      {children}
      <MenuPanel id={id} items={items} open={point !== null} anchorRef={wrapRef} point={point} onClose={close} target={target} />
    </Tag>
  )
}
