import { useCallback, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import Field from '@/components/ui/Field'
import { describedBy, fieldClass } from '@/lib/field'
import { portalTarget, useFloating } from '@/hooks/useFloating'
import { addDays, fromISO, toISO, TODAY, weekdayIndex } from '@/lib/date'
import { cn } from '@/lib/cn'

const dayNames = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg']
const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
const valueFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
const longFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/**
 * Kalender inline (dipakai sendiri atau di dalam DatePicker).
 * Navigasi keyboard: panah = pindah hari/minggu, PageUp/PageDown = bulan, Enter = pilih.
 */
export function CalendarGrid({ value, onSelect, min, autoFocus = false }) {
  const [focus, setFocus] = useState(value || TODAY)
  const [cursor, setCursor] = useState(() => fromISO(`${(value || TODAY).slice(0, 8)}01`))
  const gridRef = useRef(null)

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const start = addDays(-weekdayIndex(first), first)
  const cells = Array.from({ length: 42 }, (_, i) => toISO(addDays(i, start)))

  const moveTo = (iso) => {
    setFocus(iso)
    const d = fromISO(iso)
    if (d.getMonth() !== cursor.getMonth() || d.getFullYear() !== cursor.getFullYear()) setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
    requestAnimationFrame(() => gridRef.current?.querySelector(`[data-iso="${iso}"]`)?.focus())
  }
  const shift = (n) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1))

  const onKey = (e) => {
    const d = fromISO(focus)
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (map[e.key] !== undefined) { e.preventDefault(); moveTo(toISO(addDays(map[e.key], d))) }
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      moveTo(toISO(new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), Math.min(d.getDate(), 28))))
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!min || focus >= min) onSelect(focus) }
  }

  return (
    <div className="w-[17.5rem] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="pl-1 text-sm font-semibold capitalize" aria-live="polite">{monthFmt.format(cursor)}</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => shift(-1)} aria-label="Bulan sebelumnya" className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-canvas hover:text-ink"><ChevronLeft className="size-4" /></button>
          <button type="button" onClick={() => shift(1)} aria-label="Bulan berikutnya" className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-canvas hover:text-ink"><ChevronRight className="size-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[0.6875rem] font-medium text-muted" aria-hidden="true">
        {dayNames.map((d) => <span key={d} className="py-1">{d}</span>)}
      </div>
      <div ref={gridRef} role="group" aria-label={monthFmt.format(cursor)} onKeyDown={onKey} className="grid grid-cols-7 gap-0.5">
        {cells.map((iso) => {
          const inMonth = fromISO(iso).getMonth() === cursor.getMonth()
          const sel = iso === value
          const disabled = Boolean(min && iso < min)
          return (
            <button
              key={iso}
              type="button"
              data-iso={iso}
              aria-pressed={sel}
              aria-label={longFmt.format(fromISO(iso))}
              aria-disabled={disabled || undefined}
              tabIndex={iso === focus ? 0 : -1}
              autoFocus={autoFocus && iso === focus}
              onClick={() => !disabled && onSelect(iso)}
              className={cn(
                'relative grid h-9 place-items-center rounded-lg text-sm tabular-nums transition-colors',
                inMonth ? 'text-ink' : 'text-muted',
                !sel && !disabled && 'hover:bg-canvas',
                sel && 'bg-forest font-semibold text-surface',
                disabled && 'cursor-not-allowed opacity-35',
                iso === TODAY && !sel && 'font-semibold text-forest after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-forest',
              )}
            >
              {Number(iso.slice(8))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DatePicker({ label, value, onChange, placeholder = 'Pilih tanggal', hint, error, required, className, min, clearable = false }) {
  const id = useId()
  const anchorRef = useRef(null)
  const panelRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState(null)

  const close = useCallback((refocus) => {
    setOpen(false)
    if (refocus) anchorRef.current?.focus()
  }, [])
  const style = useFloating({ open, anchorRef, panelRef, onClose: close, matchWidth: false })
  const emit = (v) => onChange?.({ target: { value: v } })

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <button
        ref={anchorRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, hint, error)}
        onClick={() => { if (open) close(); else { setTarget(portalTarget(anchorRef.current)); setOpen(true) } }}
        className={cn(fieldClass, 'gap-2.5 text-left', open && 'border-forest ring-3 ring-forest/15')}
      >
        <CalendarDays className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <span className={cn('flex-1 truncate', !value && 'text-muted')}>{value ? valueFmt.format(fromISO(value)) : placeholder}</span>
      </button>

      {open && target && createPortal(
        <div ref={panelRef} style={style} role="dialog" aria-label={label ?? 'Pilih tanggal'} className="float-panel z-[70] overflow-hidden rounded-xl border border-line bg-surface shadow-soft-lg">
          <CalendarGrid value={value} min={min} autoFocus onSelect={(iso) => { emit(iso); close(true) }} />
          <div className="flex items-center justify-between border-t border-line px-3 py-2">
            <button type="button" onClick={() => { emit(TODAY); close(true) }} className="rounded-md px-2 py-1 text-sm font-semibold text-forest hover:bg-sage">Hari ini</button>
            {clearable && value && <button type="button" onClick={() => { emit(''); close(true) }} className="rounded-md px-2 py-1 text-sm text-ink-2 hover:bg-canvas">Kosongkan</button>}
          </div>
        </div>,
        target,
      )}
    </Field>
  )
}
