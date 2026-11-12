import { m } from 'motion/react'
import { cn } from '@/lib/cn'

export default function ProgressBar({ value, max = 100, color = 'bg-forest', label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  // Isi bar selalu hijau kecuali aksen hangat yang diminta eksplisit (mis. di atas panel gelap).
  const fill = ['bg-clay', 'bg-forest-mid'].includes(color) ? color : 'bg-forest'
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="h-3 overflow-hidden rounded-full bg-canvas shadow-inset"
    >
      <m.div
        className={cn('h-full rounded-full', fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  )
}
