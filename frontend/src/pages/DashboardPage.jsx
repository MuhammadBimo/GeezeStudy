import { Link } from 'react-router-dom'
import { Play, Plus } from 'lucide-react'
import AnnouncementBanner from '@/components/dashboard/AnnouncementBanner'
import TodayStrip from '@/components/dashboard/TodayStrip'
import TaskList from '@/components/dashboard/TaskList'
import AgendaTimeline from '@/components/dashboard/AgendaTimeline'
import StudySummary from '@/components/dashboard/StudySummary'
import MissionList from '@/components/dashboard/MissionList'
import GoalList from '@/components/dashboard/GoalList'
import AchievementList from '@/components/dashboard/AchievementList'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import Skeleton from '@/components/ui/Skeleton'
import AsyncView from '@/components/ui/AsyncView'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { dueInfo, greeting } from '@/lib/date'

const dateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

// Satu kalimat yang langsung menjawab "apa yang harus dikerjakan sekarang".
function summaryLine(d) {
  const next = d.open_tasks[0]
  if (!next) return 'Tidak ada tugas tertunda. Waktu yang pas untuk mencicil target belajar.'
  const due = dueInfo(next.due_at)
  const count = d.open_tasks_count
  return `${count} tugas menunggu. Paling dekat: ${next.title} (${due.text.charAt(0).toLowerCase()}${due.text.slice(1)}).`
}

function Dashboard({ d, resource }) {
  const toast = useToast()
  const { user } = d

  // Selesaikan di server (Points dihitung di sana), hilangkan dari daftar, lalu segarkan ringkasan.
  const completeTask = async (task) => {
    try {
      await api.patch(`/tasks/${task.id}`, { status: 'completed' })
      toast.success('Tugas selesai', { description: `${task.title}. Points ditambahkan.` })
      resource.reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  return (
    <>
      <AnnouncementBanner items={d.announcements} />

      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0 max-w-2xl">
          <p className="text-sm capitalize text-ink-2">{dateFmt.format(new Date())}</p>
          <h1 className="mt-1 text-[2rem] sm:text-[2.5rem]">{greeting()}, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-ink-2">{summaryLine(d)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/tugas?baru=1" className="inline-flex h-11 items-center gap-2 rounded-control bg-surface px-4.5 font-semibold text-ink shadow-raised transition-[background-color,transform] hover:bg-[#f3f2ea] active:scale-[0.98]">
            <Plus className="size-4" aria-hidden="true" /> Tambah tugas
          </Link>
          <Link to="/timer" className="inline-flex h-11 items-center gap-2 rounded-control bg-forest px-4.5 font-semibold text-surface shadow-soft-sm transition-[background-color,transform] hover:bg-forest-mid active:scale-[0.98]">
            <Play className="size-4" aria-hidden="true" /> Mulai sesi fokus
          </Link>
        </div>
      </header>

      <TodayStrip
        studied={d.study_minutes_today}
        goal={user.daily_goal_minutes}
        streak={user.streak}
        best={user.best_streak}
        weekActive={d.week_active}
        level={user.level}
        points={user.points}
        floor={user.level_floor}
        next={user.next_level_at}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section aria-labelledby="todo-title">
          <SectionHeader id="todo-title" title="Yang perlu dikerjakan" to="/tugas" />
          <Card className="px-5 py-1">
            <TaskList tasks={d.open_tasks} onComplete={completeTask} />
          </Card>
        </section>
        <section aria-labelledby="agenda-title">
          <SectionHeader id="agenda-title" title="Agenda" to="/kalender" linkLabel="Kalender" />
          <Card className="p-5">
            <AgendaTimeline events={d.upcoming_events} />
          </Card>
        </section>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section aria-labelledby="study-title">
          <SectionHeader id="study-title" title="Waktu belajar" to="/progres" linkLabel="Progres" />
          <Card className="p-5">
            <StudySummary minutes={d.study_minutes_week} goal={user.daily_goal_minutes} />
          </Card>
        </section>
        <section aria-labelledby="mission-title">
          <SectionHeader id="mission-title" title="Misi harian" to="/misi" linkLabel="Semua misi" />
          <Card variant="sand" className="p-5">
            <MissionList missions={d.daily_missions} />
          </Card>
        </section>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="goal-title">
          <SectionHeader id="goal-title" title="Goals berjalan" to="/goals" />
          <GoalList goals={d.goals} />
        </section>
        <section aria-labelledby="ach-title">
          <SectionHeader id="ach-title" title="Achievements" to="/achievements" />
          <AchievementList items={d.achievements} />
        </section>
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Memuat beranda" className="space-y-8">
      <div className="space-y-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-10 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div>
      <Skeleton className="h-32 w-full rounded-panel" />
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]"><Skeleton className="h-72 rounded-panel" /><Skeleton className="h-72 rounded-panel" /></div>
    </div>
  )
}

export default function DashboardPage() {
  const resource = useResource('/dashboard')
  if (resource.loading && !resource.error) return <DashboardSkeleton />
  return <AsyncView resource={resource}>{(d) => <Dashboard d={d} resource={resource} />}</AsyncView>
}
