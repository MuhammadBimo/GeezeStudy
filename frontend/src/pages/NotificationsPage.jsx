import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Toggle from '@/components/ui/Toggle'
import { cn } from '@/lib/cn'

const categories = [
  { value: 'all', label: 'Semua' },
  { value: 'academic', label: 'Akademik' },
  { value: 'productivity', label: 'Produktivitas' },
  { value: 'social', label: 'Sosial' },
  { value: 'achievement', label: 'Achievements' },
  { value: 'system', label: 'Sistem' },
]
const catMeta = {
  academic: { label: 'Akademik', color: 'bg-sky' },
  productivity: { label: 'Produktivitas', color: 'bg-mint' },
  social: { label: 'Sosial', color: 'bg-pink' },
  achievement: { label: 'Achievements', color: 'bg-yellow' },
  system: { label: 'Sistem', color: 'bg-surface' },
}

// DATA SEMENTARA (mock): akan diganti dengan data dari API backend.
const initialItems = [
  { id: 1, cat: 'academic', title: 'Deadline Laporan Basis Data hari ini', body: 'Tenggat pukul 23.59.', when: '10 menit lalu', read: false },
  { id: 2, cat: 'social', title: 'Bagas ingin berteman denganmu', body: 'Buka halaman Teman untuk menanggapi.', when: '1 jam lalu', read: false },
  { id: 3, cat: 'achievement', title: 'Achievement baru: Api Menyala', body: 'Streak 5 hari berturut-turut.', when: 'Kemarin', read: true },
  { id: 4, cat: 'productivity', title: 'Target belajar tinggal 45 menit lagi', body: 'Kamu pasti bisa mengejarnya.', when: 'Kemarin', read: true },
  { id: 5, cat: 'system', title: 'Pemeliharaan terjadwal', body: 'Minggu 02.00–03.00 WIB.', when: '2 hari lalu', read: true },
]

const initialPrefs = { academic: true, productivity: true, social: true, achievement: true, system: true }

export default function NotificationsPage() {
  const [items, setItems] = useState(initialItems)
  const [cat, setCat] = useState('all')
  const [prefs, setPrefs] = useState(initialPrefs)
  const [quiet, setQuiet] = useState({ on: true, from: '22:00', to: '06:00' })

  const visible = items.filter((i) => cat === 'all' || i.cat === cat)
  const unread = items.filter((i) => !i.read).length
  const markRead = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)))
  const markAll = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })))

  return (
    <>
      <PageHeader
        title="Notifikasi"
        subtitle={unread > 0 ? `${unread} belum dibaca.` : 'Semua sudah dibaca.'}
        action={
          <Button variant="neutral" onClick={markAll} disabled={unread === 0}>
            <CheckCheck className="size-4" aria-hidden="true" /> Tandai semua dibaca
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl label="Kategori notifikasi" options={categories} value={cat} onChange={setCat} />
            <Badge color="bg-yellow">Data contoh (sementara)</Badge>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon={BellOff} title="Tidak ada notifikasi" description="Belum ada pembaruan di kategori ini." />
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-brutal border-2 border-ink p-4 text-left shadow-brutal-sm transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                      n.read ? 'bg-surface' : 'bg-pink-soft',
                    )}
                  >
                    <span className={cn('mt-1.5 size-3 shrink-0 rounded-full border-2 border-ink', n.read ? 'bg-surface' : 'bg-pink')} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn('font-bold', !n.read && 'font-extrabold')}>{n.title}</span>
                        {!n.read && <span className="sr-only">(belum dibaca)</span>}
                      </span>
                      <span className="block text-sm text-ink/70">{n.body}</span>
                      <span className="mt-2 flex items-center gap-2 text-xs">
                        <Badge color={catMeta[n.cat].color}>{catMeta[n.cat].label}</Badge>
                        {n.when}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Card color="bg-sky" className="h-fit p-5">
          <h2 className="mb-4 text-xl font-extrabold">Preferensi</h2>
          <ul className="flex flex-col gap-3">
            {Object.entries(catMeta).map(([key, meta]) => (
              <li key={key} className="flex items-center justify-between gap-3">
                <span className="font-bold">{meta.label}</span>
                <Toggle label={`Notifikasi ${meta.label}`} checked={prefs[key]} onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t-2 border-ink pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-extrabold">Jam tenang</h3>
                <p className="text-sm">Notifikasi dibisukan pada jam ini.</p>
              </div>
              <Toggle label="Jam tenang" checked={quiet.on} onChange={(v) => setQuiet((q) => ({ ...q, on: v }))} />
            </div>
            {quiet.on && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Mulai" type="time" value={quiet.from} onChange={(e) => setQuiet((q) => ({ ...q, from: e.target.value }))} />
                <Input label="Selesai" type="time" value={quiet.to} onChange={(e) => setQuiet((q) => ({ ...q, to: e.target.value }))} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
