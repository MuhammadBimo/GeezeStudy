export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-brutal border-2 border-ink/20 bg-ink/10 ${className}`}
    />
  )
}
