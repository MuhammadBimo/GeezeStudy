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
        'relative h-7 w-12 cursor-pointer shrink-0 rounded-full border border-line transition-colors motion-reduce:transition-none',
        checked ? 'bg-forest' : 'bg-canvas shadow-inset',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-5 rounded-full bg-surface shadow-soft-sm transition-all motion-reduce:transition-none',
          checked ? 'left-[1.625rem]' : 'left-1',
        )}
      />
    </button>
  )
}
