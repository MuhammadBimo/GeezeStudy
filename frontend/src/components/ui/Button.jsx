import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

// Primary = Forest Green (aksi utama). Secondary/neutral = permukaan timbul halus (neumorphism).
const variants = {
  primary:
    'bg-forest text-surface shadow-soft-sm hover:bg-forest-mid active:bg-forest-deep active:shadow-press',
  secondary:
    'bg-surface text-forest shadow-soft-sm hover:bg-canvas active:bg-canvas active:shadow-inset',
  neutral:
    'bg-canvas text-ink shadow-soft-sm hover:bg-surface active:shadow-inset',
  danger:
    'bg-danger text-white shadow-soft-sm hover:brightness-110 active:brightness-90 active:shadow-press',
}

const sizes = {
  sm: 'min-h-9 px-3.5 py-1.5 text-sm',
  md: 'min-h-11 px-5 py-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'group inline-flex select-none items-center justify-center gap-2 rounded-panel border border-line font-semibold',
        'transition-[background-color,box-shadow,transform,filter] duration-150 ease-out',
        'hover:-translate-y-px active:translate-y-px active:scale-[0.985]',
        'disabled:pointer-events-none disabled:translate-y-0 disabled:bg-stone disabled:text-ink/80 disabled:shadow-none',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
        '[&_svg]:transition-transform [&_svg]:duration-150 active:[&_svg]:scale-90',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
