import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { useToast } from '@/hooks/useToast'
import { initialMissionTemplates, metricOptions } from '@/lib/mockAdmin'

const periodOptions = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
]
const blank = { title: '', period: 'daily', metric: 'tasks', target: '1', reward: '10' }

export default function AdminMissionsPage() {
  const toast = useToast()
  const [missions, setMissions] = useState(initialMissionTemplates)
  // editing: null | 'new' | objek misi
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')

  const open = (m) => {
    setError('')
    setForm(m === 'new' ? blank : { ...m, target: String(m.target), reward: String(m.reward) })
    setEditing(m)
  }
  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const target = Number(form.target)
    const reward = Number(form.reward)
    if (!form.title.trim()) return setError('Judul misi wajib diisi.')
    if (!(target > 0) || !(reward >= 0)) return setError('Target harus lebih dari 0 dan reward tidak boleh negatif.')
    const data = { ...form, title: form.title.trim(), target, reward }
    if (editing === 'new') setMissions((prev) => [...prev, { ...data, id: Date.now(), active: true }])
    else setMissions((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...data } : x)))
    toast(editing === 'new' ? 'Misi dibuat' : 'Misi diperbarui')
    return setEditing(null)
  }

  const toggle = (mission, active) => {
    setMissions((prev) => prev.map((x) => (x.id === mission.id ? { ...x, active } : x)))
    toast(active ? 'Misi diaktifkan' : 'Misi dinonaktifkan')
  }

  return (
    <>
      <PageHeader
        title="Misi"
        subtitle="Atur tantangan harian dan mingguan untuk Student."
        action={<Button onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" /> Misi baru</Button>}
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {missions.map((m) => (
          <Card as="li" key={m.id} color={m.active ? 'bg-surface' : 'bg-ink/5'} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold leading-snug">{m.title}</h2>
              <Toggle label={`Aktifkan misi ${m.title}`} checked={m.active} onChange={(v) => toggle(m, v)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge color={m.period === 'daily' ? 'bg-forest-tint' : 'bg-sand-deep'}>{m.period === 'daily' ? 'Harian' : 'Mingguan'}</Badge>
              <Badge color="bg-mist">{metricOptions.find((o) => o.value === m.metric)?.label}: {m.target}</Badge>
              <Badge color="bg-moss">+{m.reward} pts</Badge>
            </div>
            <Button size="sm" variant="neutral" className="self-start" onClick={() => open(m)}>
              <Pencil className="size-4" aria-hidden="true" /> Ubah
            </Button>
          </Card>
        ))}
      </ul>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Misi baru' : 'Ubah misi'}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Judul misi" value={form.title} onChange={set('title')} error={error} maxLength={100} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Periode" options={periodOptions} value={form.period} onChange={set('period')} />
            <Select label="Diukur dari" options={metricOptions} value={form.metric} onChange={set('metric')} />
            <Input label="Target" type="number" min={1} value={form.target} onChange={set('target')} />
            <Input label="Reward (Points)" type="number" min={0} value={form.reward} onChange={set('reward')} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setEditing(null)}>Batal</Button>
            <Button type="submit">Simpan misi</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
