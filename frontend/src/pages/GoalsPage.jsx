import { useState } from 'react'
import { Plus, Sparkles, Target } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'

const types = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'long', label: 'Jangka panjang' },
]
const typeColor = { daily: 'bg-pink-soft', weekly: 'bg-yellow', long: 'bg-sky' }
const unitOptions = [
  { value: 'menit', label: 'Menit belajar' },
  { value: 'tugas', label: 'Tugas selesai' },
  { value: 'lainnya', label: 'Lainnya (manual)' },
]

// DATA SEMENTARA (mock): akan diganti dengan data dari API backend.
const initialGoals = [
  { id: 1, type: 'daily', title: 'Belajar 90 menit', done: 45, total: 90, unit: 'menit', auto: true },
  { id: 2, type: 'daily', title: 'Selesaikan 2 tugas', done: 1, total: 2, unit: 'tugas', auto: true },
  { id: 3, type: 'weekly', title: 'Belajar 10 jam', done: 270, total: 600, unit: 'menit', auto: true },
  { id: 4, type: 'weekly', title: 'Baca 3 jurnal', done: 1, total: 3, unit: 'lainnya', auto: false },
  { id: 5, type: 'long', title: 'Lulus Basis Data dengan nilai A', done: 6, total: 14, unit: 'lainnya', auto: false },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals)
  const [type, setType] = useState('daily')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'daily', total: '', unit: 'menit' })
  const [error, setError] = useState('')

  const visible = goals.filter((g) => g.type === type)
  const setField = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const step = (id) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: Math.min(g.done + 1, g.total) } : g)))

  const submit = (e) => {
    e.preventDefault()
    const total = Number(form.total)
    if (!form.title.trim() || !(total > 0)) {
      setError('Isi judul dan target lebih dari 0.')
      return
    }
    setGoals((prev) => [...prev, { id: Date.now(), type: form.type, title: form.title.trim(), done: 0, total, unit: form.unit, auto: form.unit !== 'lainnya' }])
    setType(form.type)
    setForm({ title: '', type: form.type, total: '', unit: 'menit' })
    setError('')
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle="Target harian, mingguan, dan jangka panjang."
        action={<Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden="true" /> Buat goal</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Jenis goal" options={types} value={type} onChange={setType} />
        <Badge color="bg-yellow">Data contoh (sementara)</Badge>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Target} title="Belum ada goal di sini" description="Buat target supaya progresmu terarah." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((g) => {
            const complete = g.done >= g.total
            return (
              <Card as="li" key={g.id} color={complete ? 'bg-mint' : typeColor[g.type]} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-extrabold leading-snug">{g.title}</h2>
                  {g.auto && <Badge color="bg-surface"><Sparkles className="size-3" aria-hidden="true" /> Otomatis</Badge>}
                </div>
                <ProgressBar value={g.done} max={g.total} color="bg-ink" label={g.title} />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{g.done} / {g.total} {g.unit === 'lainnya' ? '' : g.unit}</p>
                  {complete ? (
                    <Badge color="bg-surface">Tercapai</Badge>
                  ) : (
                    !g.auto && <Button size="sm" variant="neutral" onClick={() => step(g.id)}>+1 progres</Button>
                  )}
                </div>
              </Card>
            )
          })}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Buat goal">
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Nama goal" value={form.title} onChange={setField('title')} maxLength={100} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Jenis" options={types} value={form.type} onChange={setField('type')} />
            <Select label="Satuan" options={unitOptions} value={form.unit} onChange={setField('unit')} />
          </div>
          <Input label="Target" type="number" min={1} value={form.total} onChange={setField('total')} error={error} hint="Goal dengan satuan menit atau tugas diperbarui otomatis." />
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">Simpan goal</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
