import { useId } from 'react'
import { cn } from '@/lib/cn'

// Tooltip ringan: muncul saat disorot atau difokus, dibacakan lewat aria-describedby.
export default function Tooltip({ content, side = 'top', children, className }) {
  const id = useId()
  return (
    <span className={cn('group/tip relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-surface shadow-soft',
          'opacity-0 transition-opacity delay-0 duration-150 group-hover/tip:opacity-100 group-hover/tip:delay-300 group-focus-within/tip:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  )
}
