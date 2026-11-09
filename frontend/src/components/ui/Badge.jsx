import { cn } from '@/lib/cn'

export default function Badge({ color = 'bg-yellow', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold',
        color,
        className,
      )}
      {...props}
    />
  )
}
