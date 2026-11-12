import { useState } from 'react'
import { CheckCircle2, Flame, Star, Trophy } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
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
import { mockDashboard as d } from '@/lib/mockData'

const TODAY_INDEX = (new Date().getDay() + 6) % 7

export default function DashboardPage() {
  const { user } = useAuth()
  // Toggle hanya di state lokal (data contoh); belum disimpan ke backend.
  const [tasks, setTasks] = useState(d.tasks)
  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const tasksLeft = tasks.filter((t) => !t.done).length
  const tasksDone = tasks.length - tasksLeft

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Badge color="bg-yellow">Data contoh (sementara)</Badge>
      </div>

      <AnnouncementBanner />

      <HeroGreeting
        name={user.name}
        streak={d.streak}
        studiedToday={d.weekStudyMinutes[TODAY_INDEX]}
        goalMinutes={user.dailyGoal}
        tasksLeft={tasksLeft}
      />

      <section aria-label="Statistik" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Star} label="Level" value={d.level} color="bg-pink-soft" />
        <StatCard icon={Trophy} label="Points" value={d.points} hint="Total sepanjang waktu" color="bg-yellow" />
        <StatCard icon={Flame} label="Streak" value={`${d.streak} hari`} color="bg-orange" />
        <StatCard icon={CheckCircle2} label="Tugas selesai" value={tasksDone} hint="Hari ini" color="bg-mint" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} onToggle={toggleTask} />
        </div>
        <AgendaList items={d.agenda} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StudySummary minutes={d.weekStudyMinutes} />
        <LevelCard
          level={d.level}
          points={d.points}
          nextLevelAt={d.nextLevelAt}
          streak={d.streak}
          weekActive={d.weekActive}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MissionList missions={d.missions} />
        <GoalList goals={d.goals} />
        <AchievementList items={d.achievements} />
      </div>
    </div>
  )
}
