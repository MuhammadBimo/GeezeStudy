import { cn } from '@/lib/cn'

// Filter/tab ringkas. Memakai aria-pressed pada tombol biasa (tanpa pola tablist yang butuh panel).
export default function SegmentedControl({ options, value, onChange, label, className }) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-9 rounded-full border border-line px-4 py-1.5 text-sm font-semibold transition-all duration-150 active:scale-95 motion-reduce:transition-none',
              active ? 'bg-forest text-surface shadow-press' : 'bg-surface text-ink shadow-soft-sm hover:bg-canvas',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
