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
              'rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition-all duration-150 active:scale-95 motion-reduce:transition-none',
              active ? 'bg-ink text-paper' : 'bg-surface hover:bg-yellow',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
