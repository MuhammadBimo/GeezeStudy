import { useState } from 'react'
import { Check, EyeOff, Flame, Mail, UserMinus, UserPlus, X } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Menu from '@/components/ui/Menu'
import PageHeader from '@/components/ui/PageHeader'
import Toggle from '@/components/ui/Toggle'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/hooks/useConfirm'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'

function FriendsBoard({ resource, data }) {
  const toast = useToast()
  const confirm = useConfirm()
  const { user, updateProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const run = async (action, success) => {
    try {
      await action()
      if (success) toast(success)
      resource.reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const invite = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Isi email temanmu dengan format yang benar.')
    setSending(true)
    try {
      await api.post('/friends', { email: email.trim() })
      setEmail('')
      setError('')
      toast.success('Permintaan pertemanan terkirim')
      resource.reload()
    } catch (err) {
      setError(fieldErrors(err).email ?? errorMessage(err))
    } finally {
      setSending(false)
    }
    return undefined
  }

  const unfriend = async (f) => {
    if (await confirm({ title: `Hapus ${f.name} dari teman?`, description: 'Kalian tidak akan saling melihat statistik lagi. Kamu bisa mengirim permintaan baru kapan saja.', confirmLabel: 'Hapus teman', tone: 'danger' })) {
      run(() => api.delete(`/friends/${f.friendship_id}`), 'Teman dihapus')
    }
  }

  // Urutkan teman menurut jam belajar minggu ini sebagai papan kecil (tanpa chat, hanya statistik).
  const friends = [...data.friends].sort((a, b) => (b.stats?.week_minutes ?? -1) - (a.stats?.week_minutes ?? -1))

  return (
    <>
      <PageHeader title="Teman" subtitle="Belajar lebih semangat bersama teman. Tidak ada chat; yang dibagikan hanya statistik belajar." />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="friends-title">
          <h2 id="friends-title" className="mb-3 text-base font-semibold">Teman <span className="font-normal text-muted">{friends.length}</span></h2>
          {friends.length === 0 ? (
            <div className="rounded-panel border border-line bg-surface"><EmptyState illustration="people" title="Belum ada teman" description="Kirim permintaan lewat email temanmu untuk mulai." /></div>
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs">
              {friends.map((f, i) => (
                <li key={f.friendship_id} className="flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-5">
                  <span className="w-5 text-center text-sm tabular-nums text-muted" aria-hidden="true">{f.stats ? i + 1 : '–'}</span>
                  <Avatar name={f.name} src={f.avatar_url} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{f.name}</p>
                    <p className="truncate text-sm text-ink-2">{f.institution || 'Pelajar GeezeStudy'}</p>
                  </div>
                  {f.stats ? (
                    <dl className="flex gap-5 text-sm">
                      <div><dt className="text-xs text-ink-2">Minggu ini</dt><dd className="font-semibold tabular-nums">{Math.round((f.stats.week_minutes / 60) * 10) / 10} jam</dd></div>
                      <div><dt className="text-xs text-ink-2">Streak</dt><dd className="flex items-center gap-1 font-semibold tabular-nums"><Flame className="size-3.5 text-[#b5832a]" aria-hidden="true" />{f.stats.streak}</dd></div>
                      <div><dt className="text-xs text-ink-2">Level</dt><dd className="font-semibold tabular-nums">{f.stats.level}</dd></div>
                    </dl>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-ink-2"><EyeOff className="size-4" aria-hidden="true" /> Statistik disembunyikan</span>
                  )}
                  <Menu items={[{ label: 'Hapus teman', icon: UserMinus, danger: true, onSelect: () => unfriend(f) }]} label={`Aksi untuk ${f.name}`} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="invite-title" className="rounded-panel border border-line bg-surface p-5">
            <h2 id="invite-title" className="flex items-center gap-2 font-semibold"><UserPlus className="size-4.5 text-forest" aria-hidden="true" /> Tambah teman</h2>
            <form onSubmit={invite} noValidate className="mt-3 space-y-3">
              <Input label="Email teman" labelHidden type="email" icon={Mail} autoComplete="off" placeholder="email@teman.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} hint="Temanmu harus sudah punya akun." />
              <Button type="submit" className="w-full" loading={sending}>Kirim permintaan</Button>
            </form>
            {data.outgoing.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-line pt-4" aria-label="Permintaan terkirim">
                {data.outgoing.map((o) => (
                  <li key={o.friendship_id} className="flex items-center gap-2.5 text-sm">
                    <Avatar name={o.name} src={o.avatar_url} size="xs" />
                    <span className="flex-1 truncate">{o.name} <span className="text-ink-2">· menunggu</span></span>
                    <Button size="icon-sm" variant="ghost" aria-label={`Batalkan permintaan ke ${o.name}`} onClick={() => run(() => api.delete(`/friends/${o.friendship_id}`), 'Permintaan dibatalkan')}><X aria-hidden="true" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="incoming-title" className="rounded-panel border border-sand bg-sand-soft p-5">
            <h2 id="incoming-title" className="font-semibold">Permintaan masuk {data.incoming.length > 0 && <span className="ml-1 rounded-full bg-forest px-2 py-0.5 text-xs text-surface">{data.incoming.length}</span>}</h2>
            {data.incoming.length === 0 ? (
              <p className="mt-2 text-sm text-ink-2">Tidak ada permintaan baru.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.incoming.map((r) => (
                  <li key={r.friendship_id} className="flex items-center gap-3">
                    <Avatar name={r.name} src={r.avatar_url} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
                    <Button size="icon-sm" aria-label={`Terima ${r.name}`} onClick={() => run(() => api.post(`/friends/${r.friendship_id}/accept`), `${r.name} sekarang temanmu`)}><Check aria-hidden="true" /></Button>
                    <Button size="icon-sm" variant="secondary" aria-label={`Tolak ${r.name}`} onClick={() => run(() => api.delete(`/friends/${r.friendship_id}`), 'Permintaan ditolak')}><X aria-hidden="true" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="privacy-title" className="flex items-start justify-between gap-4 px-1">
            <div>
              <h2 id="privacy-title" className="text-sm font-semibold">Tampilkan statistikku</h2>
              <p className="mt-0.5 text-sm text-ink-2">Teman bisa melihat level, streak, dan jam belajarmu.</p>
            </div>
            <Toggle
              label="Tampilkan statistik ke teman"
              checked={user.privacy_show_progress}
              onChange={async (v) => {
                try { await updateProfile({ privacy_show_progress: v }); toast(v ? 'Statistik terlihat oleh teman' : 'Statistik disembunyikan') } catch (err) { toast(errorMessage(err), 'error') }
              }}
            />
          </section>
        </aside>
      </div>
    </>
  )
}

export default function FriendsPage() {
  const resource = useResource('/friends')
  return <AsyncView resource={resource}>{(data) => <FriendsBoard resource={resource} data={data} />}</AsyncView>
}
