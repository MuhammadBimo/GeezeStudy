import { useState } from 'react'
import { Plus, Sparkles, Target, Trash2 } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
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
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'

const types = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'long', label: 'Jangka panjang' },
]
const typeColor = { daily: 'bg-forest-tint', weekly: 'bg-sand-deep', long: 'bg-mist' }
const unitOptions = [
  { value: 'menit', label: 'Menit belajar' },
  { value: 'tugas', label: 'Tugas selesai' },
  { value: 'lainnya', label: 'Lainnya (manual)' },
]

function GoalBoard({ resource, goals }) {
  const toast = useToast()
  const [type, setType] = useState('daily')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', period: 'daily', target: '', unit: 'menit' })
  const [errors, setErrors] = useState({})

  const visible = goals.filter((g) => g.period === type)
  const setField = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))
  const replace = (goal) => resource.mutate((d) => ({ ...d, data: d.data.map((g) => (g.id === goal.id ? goal : g)) }))

  const step = async (goal) => {
    try {
      const { data } = await api.patch(`/goals/${goal.id}`, { progress: goal.progress + 1 })
      replace(data)
      toast(data.progress >= data.target ? 'Goal tercapai!' : 'Progres bertambah')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const remove = async (goal) => {
    if (!window.confirm(`Hapus goal "${goal.title}"?`)) return
    try {
      await api.delete(`/goals/${goal.id}`)
      resource.mutate((d) => ({ ...d, data: d.data.filter((g) => g.id !== goal.id) }))
      toast('Goal dihapus')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const target = Number(form.target)
    if (!form.title.trim() || !(target > 0)) {
      setErrors({ target: 'Isi judul dan target lebih dari 0.' })
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post('/goals', { ...form, title: form.title.trim(), target })
      resource.mutate((d) => ({ ...d, data: [...d.data, data] }))
      setType(form.period)
      setForm({ title: '', period: form.period, target: '', unit: 'menit' })
      setErrors({})
      setOpen(false)
      toast('Goal dibuat')
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors({ target: fields.target ?? fields.title ?? errorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle="Target harian, mingguan, dan jangka panjang."
        action={<Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden="true" /> Buat goal</Button>}
      />

      <div className="mb-5">
        <SegmentedControl label="Jenis goal" options={types} value={type} onChange={setType} />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Target} title="Belum ada goal di sini" description="Buat target supaya progresmu terarah." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((g) => {
            const complete = g.progress >= g.target
            return (
              <Card as="li" key={g.id} color={complete ? 'bg-moss' : typeColor[g.period]} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-snug">{g.title}</h2>
                  <div className="flex shrink-0 items-center gap-1">
                    {g.auto && <Badge color="bg-surface"><Sparkles className="size-3" aria-hidden="true" /> Otomatis</Badge>}
                    <button
                      type="button"
                      onClick={() => remove(g)}
                      aria-label={`Hapus goal ${g.title}`}
                      className="grid size-8 place-items-center rounded-md hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <ProgressBar value={g.progress} max={g.target} label={g.title} />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{g.progress} / {g.target} {g.unit === 'lainnya' ? '' : g.unit}</p>
                  {complete ? (
                    <Badge color="bg-surface">Tercapai</Badge>
                  ) : (
                    !g.auto && <Button size="sm" variant="neutral" onClick={() => step(g)}>+1 progres</Button>
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
            <Select label="Jenis" options={types} value={form.period} onChange={setField('period')} />
            <Select label="Satuan" options={unitOptions} value={form.unit} onChange={setField('unit')} />
          </div>
          <Input label="Target" type="number" min={1} value={form.target} onChange={setField('target')} error={errors.target} hint="Goal dengan satuan menit atau tugas diperbarui otomatis dari aktivitasmu." />
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan goal</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default function GoalsPage() {
  const resource = useResource('/goals')
  return <AsyncView resource={resource}>{(page) => <GoalBoard resource={resource} goals={page.data} />}</AsyncView>
}
