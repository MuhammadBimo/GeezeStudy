import { cn } from '@/lib/cn'

export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full border-2 border-ink transition-colors motion-reduce:transition-none',
        checked ? 'bg-mint' : 'bg-surface',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full border-2 border-ink bg-ink transition-all motion-reduce:transition-none',
          checked ? 'left-[1.375rem]' : 'left-0.5',
        )}
      />
    </button>
  )
}
