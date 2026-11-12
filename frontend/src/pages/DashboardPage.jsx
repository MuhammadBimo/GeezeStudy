import { CheckCircle2, Flame, Star, Trophy } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import AnnouncementBanner from '@/components/dashboard/AnnouncementBanner'
import HeroGreeting from '@/components/dashboard/HeroGreeting'
import StatCard from '@/components/dashboard/StatCard'
import TaskList from '@/components/dashboard/TaskList'
import AgendaList from '@/components/dashboard/AgendaList'
import StudySummary from '@/components/dashboard/StudySummary'
import LevelCard from '@/components/dashboard/LevelCard'
import MissionList from '@/components/dashboard/MissionList'
import GoalList from '@/components/dashboard/GoalList'
import AchievementList from '@/components/dashboard/AchievementList'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { agendaFromApi, dayTime } from '@/lib/mappers'

const PRIORITY_LABEL = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }

function Dashboard({ d, reload }) {
  const toast = useToast()
  const { user } = d

  const tasks = d.open_tasks.map((t) => ({
    id: t.id,
    title: t.title,
    course: t.course || 'Tanpa mata kuliah',
    due: t.due_at ? dayTime(t.due_at) : 'Tanpa deadline',
    priority: PRIORITY_LABEL[t.priority],
    done: false,
  }))

  // Menandai selesai di server (Points dihitung di sana), lalu muat ulang ringkasan.
  const completeTask = async (id) => {
    try {
      await api.patch(`/tasks/${id}`, { status: 'completed' })
      toast('Tugas selesai. Points ditambahkan!')
      reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AnnouncementBanner items={d.announcements} />

      <HeroGreeting
        name={user.name}
        streak={user.streak}
        studiedToday={d.study_minutes_today}
        goalMinutes={user.daily_goal_minutes}
        tasksLeft={d.open_tasks_count}
      />

      <section aria-label="Statistik" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Star} label="Level" value={user.level} color="bg-forest-tint" />
        <StatCard icon={Trophy} label="Points" value={user.points} hint="Total sepanjang waktu" color="bg-sand-deep" />
        <StatCard icon={Flame} label="Streak" value={`${user.streak} hari`} hint={`Terbaik ${user.best_streak} hari`} color="bg-clay" />
        <StatCard icon={CheckCircle2} label="Tugas selesai" value={d.tasks_completed_today} hint="Hari ini" color="bg-moss" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} onToggle={completeTask} />
        </div>
        <AgendaList items={d.upcoming_events.map(agendaFromApi)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StudySummary minutes={d.study_minutes_week} />
        <LevelCard
          level={user.level}
          points={user.points}
          floor={user.level_floor}
          nextLevelAt={user.next_level_at}
          streak={user.streak}
          weekActive={d.week_active}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MissionList missions={d.daily_missions.map((m) => ({ id: m.id, title: m.title, done: m.progress, total: m.target, reward: m.reward_points }))} />
        <GoalList goals={d.goals.map((g) => ({ id: g.id, title: g.title, done: g.progress, total: g.target, unit: g.unit === 'lainnya' ? '' : g.unit }))} />
        <AchievementList items={d.achievements.map((a) => ({ id: a.id, title: a.title, desc: a.description, unlocked: a.unlocked }))} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const resource = useResource('/dashboard')
  return <AsyncView resource={resource} rows={5}>{(d) => <Dashboard d={d} reload={resource.reload} />}</AsyncView>
}
