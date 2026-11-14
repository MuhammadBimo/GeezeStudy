import { cn } from '@/lib/cn'

const tones = {
  neutral: 'bg-ink/[0.06] text-ink-2',
  forest: 'bg-forest text-surface',
  sage: 'bg-sage text-forest',
  sand: 'bg-sand text-[#5b4a2a]',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

export default function Badge({ tone = 'neutral', color, dot = false, className, children, ...props }) {
  return (
    <span
      className={cn('inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3', color ?? tones[tone], className)}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
