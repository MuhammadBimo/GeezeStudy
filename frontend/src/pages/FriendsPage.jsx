import { useState } from 'react'
import { EyeOff, Flame, Search, UserCheck, UserMinus, UserPlus, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'

// DATA SEMENTARA (mock): pencarian, permintaan, dan statistik akan berasal dari API.
const directory = [
  { id: 10, username: 'nadia.k', name: 'Nadia Kusuma' },
  { id: 11, username: 'rafi_dev', name: 'Rafi Pratama' },
  { id: 12, username: 'salsa.belajar', name: 'Salsa Maharani' },
]
const initialFriends = [
  { id: 1, username: 'dimas.s', name: 'Dimas Saputra', level: 6, streak: 12, weekMinutes: 420, shareStats: true },
  { id: 2, username: 'ayu_putri', name: 'Ayu Putri', level: 3, streak: 2, weekMinutes: 130, shareStats: false },
]
const initialRequests = [{ id: 20, username: 'bagas.w', name: 'Bagas Wicaksono' }]

const privacyOptions = [
  { value: 'friends', label: 'Teman bisa melihat' },
  { value: 'private', label: 'Hanya saya' },
]

const initial = (name) => name.charAt(0).toUpperCase()

function Avatar({ name, color }) {
  return (
    <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-lg font-extrabold ${color}`}>
      {initial(name)}
    </span>
  )
}

export default function FriendsPage() {
  const [friends, setFriends] = useState(initialFriends)
  const [requests, setRequests] = useState(initialRequests)
  const [sent, setSent] = useState([])
  const [query, setQuery] = useState('')
  const [privacy, setPrivacy] = useState('friends')

  const q = query.trim().toLowerCase()
  const results = q
    ? directory.filter((u) => u.username.toLowerCase().includes(q) && !friends.some((f) => f.id === u.id))
    : []

  const accept = (r) => {
    setFriends((f) => [...f, { ...r, level: 1, streak: 0, weekMinutes: 0, shareStats: true }])
    setRequests((rs) => rs.filter((x) => x.id !== r.id))
  }
  const decline = (r) => setRequests((rs) => rs.filter((x) => x.id !== r.id))
  const unfriend = (f) => {
    if (window.confirm(`Hapus ${f.name} dari daftar teman?`)) setFriends((fs) => fs.filter((x) => x.id !== f.id))
  }

  return (
    <>
      <PageHeader
        title="Teman"
        subtitle="Belajar lebih semangat bersama teman. Tidak ada chat, hanya statistik yang dibagikan."
        action={<Badge color="bg-yellow">Data contoh (sementara)</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
              <Search className="size-5" aria-hidden="true" /> Cari teman
            </h2>
            <Input label="Username" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="contoh: nadia.k" />
            {q && (
              <ul className="mt-4 flex flex-col gap-2" aria-live="polite">
                {results.length === 0 ? (
                  <li><EmptyState title="Username tidak ditemukan" description="Periksa ejaannya, lalu coba lagi." /></li>
                ) : (
                  results.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 rounded-brutal border-2 border-ink p-3">
                      <Avatar name={u.name} color="bg-sky" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{u.name}</p>
                        <p className="text-sm text-ink/70">@{u.username}</p>
                      </div>
                      {sent.includes(u.id) ? (
                        <Badge color="bg-mint">Permintaan terkirim</Badge>
                      ) : (
                        <Button size="sm" onClick={() => setSent((s) => [...s, u.id])}>
                          <UserPlus className="size-4" aria-hidden="true" /> Tambah
                        </Button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </Card>

          <Card tone="primary" className="p-5">
            <h2 className="mb-3 text-xl font-extrabold">Teman ({friends.length})</h2>
            {friends.length === 0 ? (
              <EmptyState icon={UserPlus} title="Belum ada teman" description="Cari username temanmu untuk mulai." />
            ) : (
              <ul className="flex flex-col gap-3">
                {friends.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center gap-3 rounded-brutal border-2 border-ink p-3">
                    <Avatar name={f.name} color="bg-pink" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{f.name}</p>
                      <p className="text-sm text-ink/70">@{f.username}</p>
                    </div>
                    {f.shareStats ? (
                      <div className="flex flex-wrap gap-2">
                        <Badge color="bg-violet">Level {f.level}</Badge>
                        <Badge color="bg-orange"><Flame className="size-3" aria-hidden="true" /> {f.streak} hari</Badge>
                        <Badge color="bg-mint">{Math.round(f.weekMinutes / 60 * 10) / 10} jam/minggu</Badge>
                      </div>
                    ) : (
                      <Badge color="bg-surface"><EyeOff className="size-3" aria-hidden="true" /> Statistik disembunyikan</Badge>
                    )}
                    <button type="button" onClick={() => unfriend(f)} aria-label={`Hapus ${f.name} dari teman`} className="grid size-9 place-items-center rounded-md border-2 border-transparent hover:border-ink hover:bg-pink">
                      <UserMinus className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card color="bg-yellow" className="p-5">
            <h2 className="mb-3 text-xl font-extrabold">Permintaan masuk</h2>
            {requests.length === 0 ? (
              <p className="text-sm font-medium">Tidak ada permintaan baru.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {requests.map((r) => (
                  <li key={r.id} className="rounded-brutal border-2 border-ink bg-surface p-3">
                    <p className="font-bold">{r.name}</p>
                    <p className="mb-2 text-sm text-ink/70">@{r.username}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => accept(r)}><UserCheck className="size-4" aria-hidden="true" /> Terima</Button>
                      <Button size="sm" variant="neutral" onClick={() => decline(r)}><X className="size-4" aria-hidden="true" /> Tolak</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-xl font-extrabold">Privasi statistik</h2>
            <p className="mb-3 text-sm text-ink/70">Atur siapa yang boleh melihat Level, Streak, dan waktu belajarmu.</p>
            <SegmentedControl label="Privasi statistik" options={privacyOptions} value={privacy} onChange={setPrivacy} />
          </Card>
        </div>
      </div>
    </>
  )
}
