import { cn } from '@/lib/cn'

// Varian permukaan: surface (panel standar), tint (sage), sand, plain (tanpa bingkai, untuk section).
const variants = {
  surface: 'border border-line bg-surface shadow-xs',
  tint: 'border border-sage-deep/60 bg-sage',
  sand: 'border border-sand bg-sand-soft',
  plain: '',
  dark: 'bg-forest text-surface',
}

export default function Card({ as: Tag = 'div', variant = 'surface', interactive = false, color, tone, className, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-panel',
        variants[variant],
        tone === 'primary' && 'shadow-soft',
        interactive && 'transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft motion-reduce:hover:translate-y-0',
        color,
        className,
      )}
      {...props}
    />
  )
}
