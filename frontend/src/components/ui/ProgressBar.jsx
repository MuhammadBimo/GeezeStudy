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
      <div className={`h-full border-r-2 border-ink ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
