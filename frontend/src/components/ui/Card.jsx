import { cn } from '@/lib/cn'

// tone="primary": panel utama (lebih timbul). Default: panel sekunder.
export default function Card({ as: Tag = 'div', color = 'bg-surface', tone = 'default', className, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-panel border border-line',
        tone === 'primary' ? 'shadow-soft-lg' : 'shadow-soft',
        color,
        className,
      )}
      {...props}
    />
  )
}
