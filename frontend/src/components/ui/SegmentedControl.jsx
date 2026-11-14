import { useId } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'

// Tab ringkas dengan indikator yang bergeser halus ke pilihan aktif.
export default function SegmentedControl({ options, value, onChange, label, className, size = 'md' }) {
  const layoutId = useId()
  return (
    <div role="group" aria-label={label} className={cn('thin-scroll inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-ink/[0.05] p-1 [scrollbar-width:none]', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative shrink-0 whitespace-nowrap rounded-lg font-medium transition-colors duration-150',
              size === 'sm' ? 'h-8 px-3 text-[0.8125rem]' : 'h-9 px-3.5 text-sm',
              active ? 'text-ink' : 'text-ink-2 hover:text-ink',
            )}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-lg bg-surface shadow-raised"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {o.count !== undefined && <span className="text-xs tabular-nums text-muted">{o.count}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
