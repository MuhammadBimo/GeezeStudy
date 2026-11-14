import { cn } from '@/lib/cn'

export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={cn('skeleton animate-shimmer rounded-lg', className)} />
}

// Kerangka siap pakai yang meniru bentuk halaman, bukan sekadar kotak abu-abu.
export function SkeletonList({ rows = 4 }) {
  return (
    <div className="divide-y divide-line rounded-panel border border-line bg-surface">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-panel border border-line bg-surface p-5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}
