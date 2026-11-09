import { m } from 'motion/react'
import { cn } from '@/lib/cn'

export default function ProgressBar({ value, max = 100, color = 'bg-pink', label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="h-4 overflow-hidden rounded-full border-2 border-ink bg-surface"
    >
      {/* Bar mengisi dari kosong saat muncul dan bergeser halus saat nilainya berubah. */}
      <m.div
        className={cn('h-full border-ink', pct > 0 && 'border-r-2', color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
