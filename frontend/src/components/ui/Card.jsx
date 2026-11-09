import { cn } from '@/lib/cn'

// tone="primary": kartu utama (border 3px, shadow besar). Default: kartu sekunder.
export default function Card({ as: Tag = 'div', color = 'bg-surface', tone = 'default', className, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-brutal border-ink',
        tone === 'primary' ? 'border-[3px] shadow-brutal-lg' : 'border-2 shadow-brutal',
        color,
        className,
      )}
      {...props}
    />
  )
}
