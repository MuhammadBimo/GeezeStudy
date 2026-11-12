import { useState } from 'react'
import { EyeOff, Flame, UserCheck, UserMinus, UserPlus, X } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'

const privacyOptions = [
  { value: 'show', label: 'Teman bisa melihat' },
  { value: 'hide', label: 'Hanya saya' },
]

function Avatar({ name, color }) {
  return (
    <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full border border-line font-display text-lg font-medium ${color}`}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function FriendsBoard({ resource, data }) {
  const toast = useToast()
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
    if (!email.trim()) {
      setError('Isi email temanmu.')
      return
    }
    setSending(true)
    try {
      await api.post('/friends', { email: email.trim() })
      setEmail('')
      setError('')
      toast('Permintaan pertemanan terkirim')
      resource.reload()
    } catch (err) {
      setError(fieldErrors(err).email ?? errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const changePrivacy = async (value) => {
    try {
      await updateProfile({ privacy_show_progress: value === 'show' })
      toast('Privasi diperbarui')
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const unfriend = (f) => {
    if (window.confirm(`Hapus ${f.name} dari daftar teman?`)) run(() => api.delete(`/friends/${f.friendship_id}`), 'Teman dihapus')
  }

  return (
    <>
      <PageHeader
        title="Teman"
        subtitle="Belajar lebih semangat bersama teman. Tidak ada chat, hanya statistik yang dibagikan."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <UserPlus className="size-5" aria-hidden="true" /> Tambah teman
            </h2>
            <form onSubmit={invite} noValidate className="flex flex-wrap items-start gap-3">
              <Input className="min-w-60 flex-1" label="Email teman" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} error={error} hint="Temanmu harus sudah punya akun GeezeStudy." />
              <Button type="submit" className="mt-6" loading={sending}>Kirim permintaan</Button>
            </form>
            {data.outgoing.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Permintaan terkirim">
                {data.outgoing.map((o) => (
                  <li key={o.friendship_id} className="flex items-center gap-1">
                    <Badge color="bg-moss">Menunggu: {o.name}</Badge>
                    <button type="button" onClick={() => run(() => api.delete(`/friends/${o.friendship_id}`), 'Permintaan dibatalkan')} aria-label={`Batalkan permintaan ke ${o.name}`} className="grid size-6 place-items-center rounded-full hover:bg-danger/10 hover:text-danger">
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card tone="primary" className="p-5">
            <h2 className="mb-3 text-xl font-semibold">Teman ({data.friends.length})</h2>
            {data.friends.length === 0 ? (
              <EmptyState icon={UserPlus} title="Belum ada teman" description="Kirim permintaan lewat email temanmu untuk mulai." />
            ) : (
              <ul className="flex flex-col gap-3">
                {data.friends.map((f) => (
                  <li key={f.friendship_id} className="flex flex-wrap items-center gap-3 rounded-panel border border-line p-3">
                    <Avatar name={f.name} color="bg-sage" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{f.name}</p>
                      {f.institution && <p className="truncate text-sm text-ink/80">{f.institution}</p>}
                    </div>
                    {f.stats ? (
                      <div className="flex flex-wrap gap-2">
                        <Badge color="bg-stone">Level {f.stats.level}</Badge>
                        <Badge color="bg-clay"><Flame className="size-3" aria-hidden="true" /> {f.stats.streak} hari</Badge>
                        <Badge color="bg-moss">{Math.round((f.stats.week_minutes / 60) * 10) / 10} jam/minggu</Badge>
                      </div>
                    ) : (
                      <Badge color="bg-surface"><EyeOff className="size-3" aria-hidden="true" /> Statistik disembunyikan</Badge>
                    )}
                    <button type="button" onClick={() => unfriend(f)} aria-label={`Hapus ${f.name} dari teman`} className="grid size-9 place-items-center rounded-md border border-transparent hover:bg-danger/10 hover:text-danger">
                      <UserMinus className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card color="bg-sand-deep" className="p-5">
            <h2 className="mb-3 text-xl font-semibold">Permintaan masuk</h2>
            {data.incoming.length === 0 ? (
              <p className="text-sm font-medium">Tidak ada permintaan baru.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.incoming.map((r) => (
                  <li key={r.friendship_id} className="rounded-panel border border-line bg-surface p-3">
                    <p className="mb-2 font-semibold">{r.name}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => run(() => api.post(`/friends/${r.friendship_id}/accept`), `${r.name} sekarang temanmu`)}>
                        <UserCheck className="size-4" aria-hidden="true" /> Terima
                      </Button>
                      <Button size="sm" variant="neutral" onClick={() => run(() => api.delete(`/friends/${r.friendship_id}`), 'Permintaan ditolak')}>
                        <X className="size-4" aria-hidden="true" /> Tolak
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-xl font-semibold">Privasi statistik</h2>
            <p className="mb-3 text-sm text-ink/80">Atur siapa yang boleh melihat Level, Streak, dan waktu belajarmu.</p>
            <SegmentedControl label="Privasi statistik" options={privacyOptions} value={user.privacy_show_progress ? 'show' : 'hide'} onChange={changePrivacy} />
          </Card>
        </div>
      </div>
    </>
  )
}

export default function FriendsPage() {
  const resource = useResource('/friends')
  return <AsyncView resource={resource}>{(data) => <FriendsBoard resource={resource} data={data} />}</AsyncView>
}
