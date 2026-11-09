import Card from '@/components/ui/Card'

export default function StatCard({ icon: Icon, label, value, hint, color }) {
  return (
    <Card color={color} className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold">{label}</p>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="font-display text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-0.5 text-xs font-medium">{hint}</p>}
    </Card>
  )
}
