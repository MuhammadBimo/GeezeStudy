import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, CheckCircle2, Clock, Flame, Trophy } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import SectionHeader from '@/components/ui/SectionHeader'
import StatCard, { StatRow } from '@/components/dashboard/StatCard'
import { useResource } from '@/hooks/useResource'
import { clockTime, dayTime, relativeTime } from '@/lib/mappers'

const sourceIcon = (desc) => (desc.startsWith('Tugas') ? CheckCircle2 : desc.startsWith('Sesi') ? Clock : desc.startsWith('Achievement') ? Award : Trophy)

function Progress({ data }) {
  const { user } = data
  const maxed = user.next_level_at === null
  const unlocked = data.achievements.filter((a) => a.unlocked_at).length

  return (
    <>
      <PageHeader title="Progres" subtitle="Perkembangan belajarmu, dihitung dari aktivitas yang benar-benar kamu lakukan." />

      <StatRow label="Ringkasan">
        <StatCard icon={Clock} label="Total belajar" value={`${Math.floor(data.total_study_minutes / 60)} jam`} hint={`${data.total_study_minutes % 60} menit`} />
        <StatCard icon={CheckCircle2} label="Tugas selesai" value={data.tasks_completed} hint="Sepanjang waktu" />
        <StatCard icon={Flame} label="Streak" value={`${user.streak} hari`} hint={`Terbaik ${user.best_streak} hari`} />
        <StatCard icon={Trophy} label="Points" value={user.points.toLocaleString('id-ID')} hint={`Level ${user.level}`} />
      </StatRow>

      <section aria-labelledby="level-title" className="mt-8 rounded-panel bg-forest p-6 text-surface sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="level-title" className="text-sm font-medium text-surface/70">{maxed ? 'Level tertinggi' : `Menuju Level ${user.level + 1}`}</h2>
            <p className="mt-1 font-display text-[2.75rem] leading-none">Level {user.level}</p>
          </div>
          <p className="text-sm tabular-nums text-surface/80">{maxed ? `${user.points.toLocaleString('id-ID')} Points` : `${user.points.toLocaleString('id-ID')} / ${user.next_level_at.toLocaleString('id-ID')} Points`}</p>
        </div>
        <ProgressBar className="mt-5" tone="light" value={maxed ? 1 : user.points - user.level_floor} max={maxed ? 1 : user.next_level_at - user.level_floor} label="Progres level" />
        <p className="mt-3 text-sm text-surface/70">Level tidak turun saat kamu tidak aktif.</p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="points-title">
          <SectionHeader id="points-title" title="Riwayat Points" />
          {data.points_history.length === 0 ? (
            <EmptyState compact illustration="trophy" title="Belum ada Points" description="Selesaikan tugas atau sesi belajar untuk mulai." />
          ) : (
            <ol className="relative space-y-0.5 before:absolute before:bottom-3 before:left-[1.0625rem] before:top-3 before:w-px before:bg-line">
              {data.points_history.slice(0, 12).map((p) => {
                const Icon = sourceIcon(p.description)
                return (
                  <li key={p.id} className="relative flex items-center gap-3 py-2">
                    <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-forest"><Icon className="size-4" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.description}</p>
                      <p className="text-xs text-ink-2">{relativeTime(p.created_at)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-forest">+{p.points}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <div className="space-y-8">
          <section aria-labelledby="sessions-title">
            <SectionHeader id="sessions-title" title="Sesi belajar terakhir" to="/timer" linkLabel="Timer" />
            {data.recent_sessions.length === 0 ? (
              <EmptyState compact illustration="target" title="Belum ada sesi" description="Mulai timer untuk mencatat sesi pertamamu." />
            ) : (
              <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
                {data.recent_sessions.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.task?.title ?? 'Tanpa tugas'}</p>
                      <p className="text-xs text-ink-2">{dayTime(s.started_at)} – {clockTime(s.ended_at)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{s.focus_minutes} mnt</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Link to="/achievements" className="group flex items-center gap-4 rounded-panel border border-sand bg-sand-soft p-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-soft">
            <span className="grid size-12 place-items-center rounded-xl bg-sand text-[#6b5326]"><Award className="size-6" aria-hidden="true" /></span>
            <span className="flex-1">
              <span className="block font-semibold">Achievements</span>
              <span className="block text-sm text-ink-2">{unlocked} dari {data.achievements.length} sudah terbuka</span>
            </span>
            <ArrowUpRight className="size-5 text-ink-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  )
}

export default function ProgressPage() {
  const resource = useResource('/progress')
  return <AsyncView resource={resource}>{(data) => <Progress data={data} />}</AsyncView>
}
