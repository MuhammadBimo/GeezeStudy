import { useState } from 'react'
import { Award, Pencil, Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { useToast } from '@/hooks/useToast'
import { initialAchievements, metricOptions } from '@/lib/mockAdmin'

const blank = { title: '', desc: '', condition: 'tasks', target: '1', bonus: '10' }

export default function AdminAchievementsPage() {
  const toast = useToast()
  const [items, setItems] = useState(initialAchievements)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')

  const open = (a) => {
    setError('')
    setForm(a === 'new' ? blank : { ...a, target: String(a.target), bonus: String(a.bonus) })
    setEditing(a)
  }
  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const target = Number(form.target)
    const bonus = Number(form.bonus)
    if (!form.title.trim()) return setError('Nama achievement wajib diisi.')
    if (!(target > 0) || !(bonus >= 0)) return setError('Target harus lebih dari 0 dan bonus tidak boleh negatif.')
    const data = { ...form, title: form.title.trim(), desc: form.desc.trim(), target, bonus }
    if (editing === 'new') setItems((prev) => [...prev, { ...data, id: Date.now(), active: true }])
    else setItems((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...data } : x)))
    toast(editing === 'new' ? 'Achievement dibuat' : 'Achievement diperbarui')
    return setEditing(null)
  }

  const toggle = (a, active) => {
    setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, active } : x)))
    toast(active ? 'Achievement diaktifkan' : 'Achievement dinonaktifkan')
  }

  return (
    <>
      <PageHeader
        title="Achievements"
        subtitle="Atur badge dan syarat untuk membukanya."
        action={<Button onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" /> Achievement baru</Button>}
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((a) => (
          <Card as="li" key={a.id} color={a.active ? 'bg-surface' : 'bg-ink/5'} className="flex flex-col gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-orange">
                <Award className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-extrabold leading-tight">{a.title}</h2>
                <p className="text-sm text-ink/70">{a.desc || 'Tanpa deskripsi'}</p>
              </div>
              <Toggle label={`Aktifkan achievement ${a.title}`} checked={a.active} onChange={(v) => toggle(a, v)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge color="bg-sky">{metricOptions.find((o) => o.value === a.condition)?.label}: {a.target}</Badge>
              <Badge color="bg-mint">Bonus +{a.bonus} pts</Badge>
            </div>
            <Button size="sm" variant="neutral" className="self-start" onClick={() => open(a)}>
              <Pencil className="size-4" aria-hidden="true" /> Ubah
            </Button>
          </Card>
        ))}
      </ul>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Achievement baru' : 'Ubah achievement'}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Nama" value={form.title} onChange={set('title')} error={error} maxLength={60} />
          <Input label="Deskripsi" value={form.desc} onChange={set('desc')} maxLength={120} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Syarat diukur dari" options={metricOptions} value={form.condition} onChange={set('condition')} />
            <Input label="Target" type="number" min={1} value={form.target} onChange={set('target')} />
          </div>
          <Input label="Bonus Points" type="number" min={0} value={form.bonus} onChange={set('bonus')} />
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setEditing(null)}>Batal</Button>
            <Button type="submit">Simpan achievement</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
