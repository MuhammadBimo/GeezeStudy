import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import Field from '@/components/ui/Field'
import { describedBy, fieldClass } from '@/lib/field'
import { portalTarget, useFloating } from '@/hooks/useFloating'
import { cn } from '@/lib/cn'

/**
 * Select kustom (listbox). Mendukung:
 * - searchable: kotak cari di dalam panel
 * - multiple: value berupa array, pilihan tampil sebagai chip
 * onChange menerima objek mirip event ({ target: { value } }) agar kompatibel dengan pola form yang ada.
 */
export default function Select({
  label, options, value, onChange, placeholder = 'Pilih...', searchable = false, multiple = false,
  disabled = false, hint, error, required, className, labelHidden, emptyText = 'Tidak ada pilihan yang cocok.',
}) {
  const id = useId()
  const listId = `${id}-list`
  const anchorRef = useRef(null)
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [target, setTarget] = useState(null)

  const selected = useMemo(() => (multiple ? value ?? [] : [value]), [multiple, value])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options
  }, [options, query])

  const close = useCallback((refocus) => {
    setOpen(false)
    setQuery('')
    if (refocus) anchorRef.current?.focus()
  }, [])
  const style = useFloating({ open, anchorRef, panelRef, onClose: close })

  const emit = (next) => onChange?.({ target: { value: next } })
  const choose = (option) => {
    if (!option || option.disabled) return
    if (multiple) {
      const has = selected.includes(option.value)
      emit(has ? selected.filter((v) => v !== option.value) : [...selected, option.value])
    } else {
      emit(option.value)
      close(true)
    }
  }

  const openPanel = () => {
    if (disabled) return
    const idx = Math.max(0, options.findIndex((o) => selected.includes(o.value)))
    setActive(idx)
    setTarget(portalTarget(anchorRef.current))
    setOpen(true)
    requestAnimationFrame(() => (searchable ? searchRef.current : panelRef.current?.querySelector('[role=listbox]'))?.focus())
  }

  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(filtered.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(filtered.length - 1) }
    else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) { e.preventDefault(); choose(filtered[active]) }
    else if (e.key === 'Tab') close()
    else if (!searchable && e.key.length === 1) {
      const idx = filtered.findIndex((o) => String(o.label).toLowerCase().startsWith(e.key.toLowerCase()))
      if (idx >= 0) setActive(idx)
    }
  }

  const labels = options.filter((o) => selected.includes(o.value))
  const display = multiple ? null : labels[0]?.label

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className} labelHidden={labelHidden}>
      <button
        ref={anchorRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, hint, error)}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={(e) => { if (['ArrowDown', 'ArrowUp'].includes(e.key) && !open) { e.preventDefault(); openPanel() } }}
        className={cn(fieldClass, 'justify-between gap-2 text-left', multiple && labels.length > 0 && 'h-auto min-h-11 py-1.5', open && 'border-forest ring-3 ring-forest/15')}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {multiple && labels.length > 0
            ? labels.map((o) => (
                <span key={o.value} className="inline-flex items-center rounded-md bg-sage px-2 py-0.5 text-[0.8125rem] font-medium text-forest">
                  {o.label}
                </span>
              ))
            : <span className={cn('truncate', !display && 'text-muted')}>{display ?? placeholder}</span>}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && target && createPortal(
        <div ref={panelRef} style={style} className="float-panel z-[70] flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft-lg">
          {searchable && (
            <div className="relative border-b border-line p-2">
              <Search className="pointer-events-none absolute left-4.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                onKeyDown={onListKey}
                placeholder="Cari..."
                aria-label={`Cari ${label ?? 'pilihan'}`}
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${id}-opt-${active}` : undefined}
                className="h-9 w-full rounded-lg bg-canvas pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            tabIndex={searchable ? -1 : 0}
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={!searchable && filtered[active] ? `${id}-opt-${active}` : undefined}
            onKeyDown={onListKey}
            className="thin-scroll overflow-y-auto p-1.5 outline-none"
          >
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-2">{emptyText}</li>}
            {filtered.map((o, i) => {
              const isSel = selected.includes(o.value)
              return (
                <li
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled || undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] transition-colors',
                    i === active && 'bg-canvas',
                    isSel && 'font-medium text-forest',
                    o.disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {multiple && (
                    <span className={cn('grid size-4 shrink-0 place-items-center rounded border', isSel ? 'border-forest bg-forest text-surface' : 'border-line-strong')}>
                      {isSel && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                    </span>
                  )}
                  {o.icon && <o.icon className="size-4 shrink-0 text-muted" aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.description && <span className="block truncate text-xs text-ink-2">{o.description}</span>}
                  </span>
                  {!multiple && isSel && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </li>
              )
            })}
          </ul>
        </div>,
        target,
      )}
    </Field>
  )
}
