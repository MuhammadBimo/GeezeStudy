import { Link } from 'react-router-dom'
import { Award, Flame, GraduationCap, Pencil, Trophy } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import SectionHeader from '@/components/ui/SectionHeader'
import { useResource } from '@/hooks/useResource'
import { educationLabel } from '@/lib/profile'

function Profile({ data }) {
  const { user } = data
  const unlocked = data.achievements.filter((a) => a.unlocked_at)
  const facts = [
    { icon: Trophy, label: 'Level', value: user.level },
    { icon: Award, label: 'Points', value: user.points.toLocaleString('id-ID') },
    { icon: Flame, label: 'Streak', value: `${user.streak} hari` },
    { icon: GraduationCap, label: 'Tugas selesai', value: data.tasks_completed },
  ]

  return (
    <>
      <section aria-label="Profil" className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar name={user.name} src={user.avatar_url} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[2rem] sm:text-[2.5rem]">{user.name}</h1>
          <p className="mt-1 text-ink-2">{[educationLabel[user.education_level], user.institution].filter(Boolean).join(' · ') || 'Lengkapi jenjang dan institusi di Pengaturan'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="sage">{user.privacy_show_progress ? 'Statistik terlihat oleh teman' : 'Statistik disembunyikan'}</Badge>
            <Badge tone="neutral">Target {user.daily_goal_minutes} menit/hari</Badge>
          </div>
        </div>
        <Link to="/pengaturan" className="inline-flex h-11 items-center gap-2 rounded-control bg-surface px-4.5 font-semibold shadow-raised transition-[background-color,transform] hover:bg-[#f3f2ea] active:scale-[0.98]">
          <Pencil className="size-4" aria-hidden="true" /> Ubah profil
        </Link>
      </section>

      <dl className="mb-10 grid grid-cols-2 gap-y-6 border-y border-line py-6 sm:grid-cols-4">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="px-1">
            <dt className="flex items-center gap-1.5 text-sm text-ink-2"><Icon className="size-4 text-muted" aria-hidden="true" />{label}</dt>
            <dd className="mt-1 font-display text-[1.75rem] leading-tight tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="pa-title">
        <SectionHeader id="pa-title" title="Achievements terbuka" to="/achievements" />
        {unlocked.length === 0 ? (
          <EmptyState compact illustration="trophy" title="Belum ada achievement" description="Selesaikan tugas pertamamu untuk membuka yang pertama." />
        ) : (
          <ul className="flex flex-wrap gap-3">
            {unlocked.map((a) => (
              <li key={a.id} className="flex items-center gap-2.5 rounded-full border border-sand bg-sand-soft py-1.5 pl-1.5 pr-4">
                <span className="grid size-8 place-items-center rounded-full bg-sand text-[#6b5326]"><Award className="size-4" aria-hidden="true" /></span>
                <span className="text-sm font-medium">{a.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default function ProfilePage() {
  const resource = useResource('/progress')
  return <AsyncView resource={resource}>{(data) => <Profile data={data} />}</AsyncView>
}
