export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-panel border border-line/20 bg-ink/10 ${className}`}
    />
  )
}
