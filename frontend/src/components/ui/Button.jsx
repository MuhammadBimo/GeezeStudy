import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

// Satu sistem tombol. primary = Forest Green (satu aksi utama per area), secondary = permukaan timbul halus.
const variants = {
  primary: 'bg-forest text-surface shadow-soft-sm hover:bg-forest-mid active:bg-forest-deep active:shadow-press',
  secondary: 'bg-surface text-ink shadow-raised hover:bg-[#f3f2ea] active:bg-[#eceae1] active:shadow-press',
  ghost: 'bg-transparent text-ink-2 hover:bg-ink/5 hover:text-ink active:bg-ink/10',
  subtle: 'bg-sage text-forest hover:bg-sage-deep active:bg-sage-deep active:shadow-press',
  danger: 'bg-danger text-white shadow-soft-sm hover:brightness-110 active:brightness-95 active:shadow-press',
}
variants.neutral = variants.secondary

const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-11 gap-2 px-4.5 text-[0.9375rem]',
  lg: 'h-12 gap-2 px-6 text-base',
  icon: 'size-10 justify-center p-0',
  'icon-sm': 'size-8 justify-center p-0',
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
        'group/btn relative inline-flex shrink-0 select-none items-center justify-center rounded-control font-semibold whitespace-nowrap',
        'transition-[background-color,box-shadow,transform,color,filter] duration-150 ease-out',
        'active:scale-[0.98] motion-reduce:active:scale-100',
        'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-150 hover:[&_svg]:scale-105 active:[&_svg]:scale-90',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
