import { AlertTriangle, Clock, UserCheck, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import { adminActivity, adminStats, newUsersWeek } from '@/lib/mockAdmin'

const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function AdminOverviewPage() {
  const max = Math.max(...newUsersWeek)
  const total = newUsersWeek.reduce((a, b) => a + b, 0)

  return (
    <>
      <PageHeader
        title="Ringkasan"
        subtitle="Gambaran singkat aktivitas GeezeStudy."
        action={<Badge color="bg-yellow">Data contoh (sementara)</Badge>}
      />

      <section aria-label="Statistik platform" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total pengguna" value={adminStats.totalUsers.toLocaleString('id-ID')} color="bg-pink-soft" />
        <StatCard icon={UserCheck} label="Aktif hari ini" value={adminStats.activeToday} color="bg-mint" />
        <StatCard icon={Clock} label="Sesi belajar" value={adminStats.sessionsToday} hint="Hari ini" color="bg-sky" />
        <StatCard icon={AlertTriangle} label="Error 24 jam" value={adminStats.errors24h} color="bg-orange" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card tone="primary" className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-extrabold">Pengguna baru minggu ini</h2>
            <p className="font-display text-2xl font-extrabold">{total}</p>
          </div>
          <ul className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-3">
            {newUsersWeek.map((n, i) => (
              <li key={days[i]} className="flex h-full flex-col justify-end gap-1" aria-label={`${days[i]}: ${n} pengguna baru`}>
                <span className="text-center text-xs font-bold">{n}</span>
                <div className="w-full rounded-t-md border-2 border-ink bg-pink" style={{ height: `${Math.max((n / max) * 100, 6)}%` }} />
              </li>
            ))}
          </ul>
          <ul className="mt-2 grid grid-cols-7 gap-2 sm:gap-3" aria-hidden="true">
            {days.map((d) => <li key={d} className="text-center text-xs font-bold">{d}</li>)}
          </ul>
        </Card>

        <Card color="bg-yellow" className="p-5">
          <h2 className="mb-3 text-xl font-extrabold">Aktivitas admin terbaru</h2>
          <ul className="flex flex-col gap-2">
            {adminActivity.map((a) => (
              <li key={a.id} className="rounded-brutal border-2 border-ink bg-surface p-3">
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-xs text-ink/70">{a.actor} · {a.when}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
