import { AlertTriangle, Clock, UserCheck, Users } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import SectionHeader from '@/components/ui/SectionHeader'
import StatCard, { StatRow } from '@/components/dashboard/StatCard'
import { useResource } from '@/hooks/useResource'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/mappers'

const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })
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
      <StatRow label="Statistik platform">
        <StatCard icon={Users} label="Total Student" value={data.total_users.toLocaleString('id-ID')} />
        <StatCard icon={UserCheck} label="Aktif hari ini" value={data.active_today} />
        <StatCard icon={Clock} label="Sesi belajar" value={data.sessions_today} hint="Hari ini" />
        <StatCard icon={AlertTriangle} label="Error 24 jam" value={data.errors_24h} hint={data.errors_24h > 0 ? 'Cek halaman Log' : 'Semua normal'} />
      </StatRow>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="new-title">
          <SectionHeader id="new-title" title="Pengguna baru, 7 hari terakhir" meta={`${total} orang`} />
          <div className="rounded-panel border border-line bg-surface p-5">
            <ul className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-4">
              {series.map((n, i) => (
                <li key={i} className="flex h-full flex-col items-center justify-end gap-1.5" aria-label={`${days[i]}: ${n} pengguna baru`}>
                  <span className="text-xs font-semibold tabular-nums">{n}</span>
                  <div className={cn('w-full max-w-10 rounded-md', i === 6 ? 'bg-forest' : 'bg-sage-deep')} style={{ height: `${Math.max((n / max) * 82, n > 0 ? 4 : 1.5)}%` }} />
                  <span className="text-[0.6875rem] capitalize text-ink-2">{days[i]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="act-title">
          <SectionHeader id="act-title" title="Aktivitas admin" to="/admin/log" linkLabel="Semua log" />
          {data.recent_activity.length === 0 ? (
            <EmptyState compact illustration="inbox" title="Belum ada aktivitas" description="Tindakan Admin akan tercatat di sini." />
          ) : (
            <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[0.3125rem] before:top-2 before:w-px before:bg-line">
              {data.recent_activity.map((a) => (
                <li key={a.id} className="relative flex gap-3.5">
                  <span className={cn('relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-canvas', a.level === 'error' ? 'bg-danger' : a.level === 'warning' ? 'bg-[#b5832a]' : 'bg-forest')} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-ink-2">{a.actor?.name ?? 'Sistem'} · {relativeTime(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}

export default function AdminOverviewPage() {
  const resource = useResource('/admin/overview')
  return (
    <>
      <PageHeader title="Ringkasan" subtitle="Gambaran singkat aktivitas GeezeStudy hari ini." />
      <AsyncView resource={resource}>{(data) => <Overview data={data} />}</AsyncView>
    </>
  )
}
