import { m } from 'motion/react'
import { cn } from '@/lib/cn'

const fills = { forest: 'bg-forest', sand: 'bg-[#c9a96a]', light: 'bg-sand', success: 'bg-success' }

export default function ProgressBar({ value, max = 100, tone = 'forest', color, label, size = 'md', className }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  // Dukungan prop lama `color`: panel gelap memakai isi terang.
  const fill = color === 'bg-clay' ? fills.light : fills[tone] ?? fills.forest
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('overflow-hidden rounded-full', size === 'sm' ? 'h-1.5' : 'h-2', tone === 'light' || color === 'bg-clay' ? 'bg-white/15' : 'bg-ink/[0.07]', className)}
    >
      <m.div
        className={cn('h-full rounded-full', fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  )
}

// Cincin progres untuk goals dan target harian.
export function ProgressRing({ value, max = 100, size = 64, stroke = 6, children, label, tone = 'forest' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={tone === 'light' ? 'stroke-white/15' : 'stroke-ink/[0.07]'} />
        <m.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          className={tone === 'light' ? 'stroke-sand' : 'stroke-forest'}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  )
}
