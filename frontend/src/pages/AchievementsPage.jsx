import { Award, Lock } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import { useResource } from '@/hooks/useResource'
import { cn } from '@/lib/cn'

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

function Achievements({ data }) {
  const items = data.achievements
  const unlocked = items.filter((a) => a.unlocked_at)
  const locked = items.filter((a) => !a.unlocked_at).sort((a, b) => b.progress / b.threshold - a.progress / a.threshold)

  return (
    <>
      <PageHeader title="Achievements" subtitle={`${unlocked.length} dari ${items.length} pencapaian sudah terbuka. Semuanya dari aktivitas nyata, bukan dibeli.`} />

      {unlocked.length > 0 && (
        <section aria-labelledby="open-title" className="mb-10">
          <h2 id="open-title" className="mb-3 text-base font-semibold">Sudah terbuka</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((a) => (
              <li key={a.id} className="flex flex-col items-start rounded-panel border border-sand bg-sand-soft p-5">
                <span className="grid size-14 place-items-center rounded-2xl bg-sand text-[#6b5326] shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]"><Award className="size-7" aria-hidden="true" /></span>
                <h3 className="mt-4 font-display text-xl">{a.title}</h3>
                <p className="mt-1 text-sm text-ink-2">{a.description}</p>
                <p className="mt-4 text-xs text-ink-2">Terbuka {dateFmt.format(new Date(a.unlocked_at))}{a.reward_points > 0 ? ` · +${a.reward_points} Points` : ''}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {locked.length > 0 && (
        <section aria-labelledby="next-title">
          <h2 id="next-title" className="mb-3 text-base font-semibold">Berikutnya</h2>
          <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
            {locked.map((a) => (
              <li key={a.id} className="flex items-center gap-4 p-4 sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink/[0.05] text-muted"><Lock className="size-4.5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className="shrink-0 text-xs tabular-nums text-ink-2">{a.progress.toLocaleString('id-ID')} / {a.threshold.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-sm text-ink-2">{a.description}</p>
                  <ProgressBar className="mt-2" size="sm" value={a.progress} max={a.threshold} label={`Progres ${a.title}`} />
                </div>
                <span className={cn('hidden w-20 text-right text-sm text-ink-2 sm:block')}>{a.reward_points > 0 ? `+${a.reward_points}` : ''}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

export default function AchievementsPage() {
  const resource = useResource('/progress')
  return <AsyncView resource={resource} skeleton="cards" rows={6}>{(data) => <Achievements data={data} />}</AsyncView>
}
