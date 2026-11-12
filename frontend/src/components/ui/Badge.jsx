import { cn } from '@/lib/cn'

export default function Badge({ color = 'bg-sand-deep', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold',
        color,
        className,
      )}
      {...props}
    />
  )
}
