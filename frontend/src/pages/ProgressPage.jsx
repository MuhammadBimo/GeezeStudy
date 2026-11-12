import { Award, Clock, Flame, ListChecks, Lock, Trophy } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import StatCard from '@/components/dashboard/StatCard'
import { useResource } from '@/hooks/useResource'
import { dayTime, relativeTime } from '@/lib/mappers'

const badgeColors = ['bg-moss', 'bg-clay', 'bg-mist', 'bg-sand-deep', 'bg-sage', 'bg-stone']

function Progress({ data }) {
  const { user } = data
  const hours = Math.floor(data.total_study_minutes / 60)
  const maxed = user.next_level_at === null
  const span = maxed ? 1 : user.next_level_at - user.level_floor

  return (
    <>
      <PageHeader title="Progres" subtitle="Perkembangan belajarmu dari waktu ke waktu." />

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Total belajar" value={`${hours} jam`} hint={`${data.total_study_minutes % 60} menit`} color="bg-moss" />
        <StatCard icon={ListChecks} label="Tugas selesai" value={data.tasks_completed} color="bg-mist" />
        <StatCard icon={Flame} label="Streak" value={`${user.streak} hari`} hint={`Terbaik ${user.best_streak} hari`} color="bg-clay" />
        <StatCard icon={Trophy} label="Level" value={user.level} hint={`${user.points} Points`} color="bg-forest-tint" />
      </section>

      <Card tone="primary" color="bg-forest-tint" className="mt-6 p-5">
        <h2 className="text-xl font-semibold">{maxed ? `Level ${user.level} (tertinggi)` : `Menuju Level ${user.level + 1}`}</h2>
        <p className="mb-2 text-sm font-medium">
          {maxed ? `${user.points} Points. ` : `${user.points} / ${user.next_level_at} Points. `}Level tidak turun saat kamu tidak aktif.
        </p>
        <ProgressBar value={maxed ? 1 : user.points - user.level_floor} max={span} label="Progres level" />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Riwayat Points</h2>
          {data.points_history.length === 0 ? (
            <EmptyState title="Belum ada Points" description="Selesaikan tugas atau sesi belajar untuk mulai." />
          ) : (
            <ul className="flex flex-col gap-2">
              {data.points_history.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-panel border border-line p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.description}</p>
                    <p className="text-xs text-ink/80">{relativeTime(p.created_at)}</p>
                  </div>
                  <Badge color="bg-sand-deep">+{p.points}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card color="bg-mist" className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Riwayat sesi belajar</h2>
          {data.recent_sessions.length === 0 ? (
            <EmptyState title="Belum ada sesi" description="Mulai timer untuk mencatat sesi pertamamu." />
          ) : (
            <ul className="flex flex-col gap-2">
              {data.recent_sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.task?.title ?? 'Tanpa tugas'}</p>
                    <p className="text-xs text-ink/80">{dayTime(s.started_at)}</p>
                  </div>
                  <Badge color="bg-moss">{s.focus_minutes} mnt</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <h2 className="mb-3 mt-8 flex items-center gap-2 text-2xl font-semibold">
        <Award className="size-6" aria-hidden="true" /> Achievements
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.achievements.map((a, i) => {
          const unlocked = a.unlocked_at !== null
          const Icon = unlocked ? Award : Lock
          return (
            <Card as="li" key={a.id} color={unlocked ? 'bg-surface' : 'bg-canvas'} className="flex items-center gap-4 p-4">
              <span className={`grid size-14 shrink-0 place-items-center rounded-full border border-line ${unlocked ? badgeColors[i % badgeColors.length] : 'bg-surface'}`}>
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-medium leading-tight">{a.title}</h3>
                <p className="text-sm text-ink/80">{unlocked ? a.description : `Terkunci. ${a.description}`}</p>
                {!unlocked && <p className="mt-1 text-xs font-semibold">{a.progress} / {a.threshold}</p>}
              </div>
            </Card>
          )
        })}
      </ul>
    </>
  )
}

export default function ProgressPage() {
  const resource = useResource('/progress')
  return <AsyncView resource={resource} rows={4}>{(data) => <Progress data={data} />}</AsyncView>
}
