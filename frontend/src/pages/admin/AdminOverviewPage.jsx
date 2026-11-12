import { AlertTriangle, Clock, UserCheck, Users } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import { useResource } from '@/hooks/useResource'
import { relativeTime } from '@/lib/mappers'

const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })
// 7 hari terakhir, urut dari yang terlama sampai hari ini (sama dengan urutan dari API).
const lastSevenDays = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return dayFmt.format(d)
})

function Overview({ data }) {
  const days = lastSevenDays()
  const series = data.new_users_week
  const max = Math.max(...series, 1)
  const total = series.reduce((a, b) => a + b, 0)

  return (
    <>
      <section aria-label="Statistik platform" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Student" value={data.total_users.toLocaleString('id-ID')} color="bg-forest-tint" />
        <StatCard icon={UserCheck} label="Aktif hari ini" value={data.active_today} color="bg-moss" />
        <StatCard icon={Clock} label="Sesi belajar" value={data.sessions_today} hint="Hari ini" color="bg-mist" />
        <StatCard icon={AlertTriangle} label="Error 24 jam" value={data.errors_24h} color="bg-clay" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card tone="primary" className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold">Pengguna baru 7 hari terakhir</h2>
            <p className="font-display text-2xl font-semibold">{total}</p>
          </div>
          <ul className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-3">
            {series.map((n, i) => (
              <li key={i} className="flex h-full flex-col justify-end gap-1" aria-label={`${days[i]}: ${n} pengguna baru`}>
                <span className="text-center text-xs font-semibold">{n}</span>
                <div className={`w-full rounded-t-lg ${n === max && n > 0 ? 'bg-forest' : 'bg-sage'}`} style={{ height: `${Math.max((n / max) * 100, 4)}%` }} />
              </li>
            ))}
          </ul>
          <ul className="mt-2 grid grid-cols-7 gap-2 sm:gap-3" aria-hidden="true">
            {days.map((d, i) => <li key={i} className="text-center text-xs font-semibold">{d}</li>)}
          </ul>
        </Card>

        <Card color="bg-sand-deep" className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Aktivitas admin terbaru</h2>
          {data.recent_activity.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" description="Tindakan Admin akan tercatat di sini." />
          ) : (
            <ul className="flex flex-col gap-2">
              {data.recent_activity.map((a) => (
                <li key={a.id} className="rounded-panel border border-line bg-surface p-3">
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-ink/80">{a.actor?.name ?? 'Sistem'} · {relativeTime(a.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}

export default function AdminOverviewPage() {
  const resource = useResource('/admin/overview')
  return (
    <>
      <PageHeader title="Ringkasan" subtitle="Gambaran singkat aktivitas GeezeStudy." />
      <AsyncView resource={resource} rows={4}>{(data) => <Overview data={data} />}</AsyncView>
    </>
  )
}
