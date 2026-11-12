import Card from '@/components/ui/Card'

// Widget angka: warna hanya dipakai pada chip ikon agar deretan statistik tetap tenang.
export default function StatCard({ icon: Icon, label, value, hint, color = 'bg-forest-tint' }) {
  return (
    <Card className="p-4 transition-shadow duration-200 hover:shadow-soft-lg motion-reduce:transition-none">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`grid size-8 place-items-center rounded-lg text-forest ${color}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <p className="text-sm text-ink/80">{label}</p>
      </div>
      <p className="font-display text-3xl font-medium tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink/80">{hint}</p>}
    </Card>
  )
}
