import { Award, Clock, Flag, Flame, ListChecks, Lock, Timer, Trophy } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import StatCard from '@/components/dashboard/StatCard'

// DATA SEMENTARA (mock): akan diganti dengan data dari API backend.
const data = {
  level: 4,
  points: 340,
  nextLevelAt: 500,
  totalMinutes: 1260,
  tasksDone: 23,
  streak: 6,
  bestStreak: 11,
  pointsHistory: [
    { id: 1, source: 'Sesi belajar 25 menit', points: 25, when: 'Hari ini' },
    { id: 2, source: 'Tugas selesai: Baca jurnal UI/UX', points: 20, when: 'Kemarin' },
    { id: 3, source: 'Misi harian: Belajar 25 menit', points: 15, when: 'Kemarin' },
    { id: 4, source: 'Achievement: Api Menyala', points: 50, when: '2 hari lalu' },
  ],
  sessions: [
    { id: 1, task: 'Rangkuman Bab 5', minutes: 25, when: 'Kemarin, 19:30' },
    { id: 2, task: 'Latihan Soal Kalkulus', minutes: 50, when: 'Kemarin, 15:10' },
    { id: 3, task: 'Laporan Praktikum Basis Data', minutes: 45, when: '2 hari lalu' },
  ],
  achievements: [
    { id: 1, title: 'Langkah Pertama', desc: 'Selesaikan tugas pertama', unlocked: true, icon: Flag, color: 'bg-mint' },
    { id: 2, title: 'Api Menyala', desc: 'Streak 5 hari', unlocked: true, icon: Flame, color: 'bg-orange' },
    { id: 3, title: 'Pelari Tugas', desc: 'Selesaikan 20 tugas', unlocked: true, icon: ListChecks, color: 'bg-sky' },
    { id: 4, title: 'Fokus Penuh', desc: 'Belajar 2 jam dalam sehari', unlocked: false, icon: Timer, color: 'bg-pink' },
    { id: 5, title: 'Seminggu Penuh', desc: 'Streak 7 hari', unlocked: false, icon: Flame, color: 'bg-yellow' },
    { id: 6, title: 'Level 5', desc: 'Capai Level 5', unlocked: false, icon: Trophy, color: 'bg-violet' },
  ],
}

export default function ProgressPage() {
  const hours = Math.floor(data.totalMinutes / 60)

  return (
    <>
      <PageHeader
        title="Progres"
        subtitle="Perkembangan belajarmu dari waktu ke waktu."
        action={<Badge color="bg-yellow">Data contoh (sementara)</Badge>}
      />

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Total belajar" value={`${hours} jam`} hint={`${data.totalMinutes % 60} menit`} color="bg-mint" />
        <StatCard icon={ListChecks} label="Tugas selesai" value={data.tasksDone} color="bg-sky" />
        <StatCard icon={Flame} label="Streak" value={`${data.streak} hari`} hint={`Terbaik ${data.bestStreak} hari`} color="bg-orange" />
        <StatCard icon={Trophy} label="Level" value={data.level} hint={`${data.points} Points`} color="bg-pink-soft" />
      </section>

      <Card tone="primary" color="bg-violet" className="mt-6 p-5">
        <h2 className="text-xl font-extrabold">Menuju Level {data.level + 1}</h2>
        <p className="mb-2 text-sm font-medium">{data.points} / {data.nextLevelAt} Points. Level tidak turun saat kamu tidak aktif.</p>
        <ProgressBar value={data.points} max={data.nextLevelAt} color="bg-yellow" label="Progres level" />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-extrabold">Riwayat Points</h2>
          <ul className="flex flex-col gap-2">
            {data.pointsHistory.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-brutal border-2 border-ink p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{p.source}</p>
                  <p className="text-xs text-ink/70">{p.when}</p>
                </div>
                <Badge color="bg-yellow">+{p.points}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card color="bg-sky" className="p-5">
          <h2 className="mb-3 text-xl font-extrabold">Riwayat sesi belajar</h2>
          <ul className="flex flex-col gap-2">
            {data.sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-brutal border-2 border-ink bg-surface p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{s.task}</p>
                  <p className="text-xs text-ink/70">{s.when}</p>
                </div>
                <Badge color="bg-mint">{s.minutes} mnt</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 flex items-center gap-2 text-2xl font-extrabold">
        <Award className="size-6" aria-hidden="true" /> Achievements
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.achievements.map((a) => {
          const Icon = a.unlocked ? a.icon : Lock
          return (
            <Card as="li" key={a.id} color={a.unlocked ? 'bg-surface' : 'bg-ink/5'} className="flex items-center gap-4 p-4">
              <span className={`grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink ${a.unlocked ? a.color : 'bg-surface'}`}>
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-lg font-extrabold leading-tight">{a.title}</h3>
                <p className="text-sm text-ink/70">{a.unlocked ? a.desc : `Terkunci. ${a.desc}`}</p>
              </div>
            </Card>
          )
        })}
      </ul>
    </>
  )
}
