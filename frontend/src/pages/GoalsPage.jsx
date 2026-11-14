import { useState } from 'react'
import { Minus, Plus, Sparkles, Trash2 } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Menu from '@/components/ui/Menu'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import { ProgressRing } from '@/components/ui/ProgressBar'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import { useConfirm } from '@/hooks/useConfirm'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { cn } from '@/lib/cn'

const periods = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'long', label: 'Jangka panjang' },
]
const unitOptions = [
  { value: 'menit', label: 'Menit belajar', description: 'Dihitung otomatis dari sesi timer' },
  { value: 'tugas', label: 'Tugas selesai', description: 'Dihitung otomatis dari tugas' },
  { value: 'lainnya', label: 'Lainnya', description: 'Kamu tambah progresnya sendiri' },
]

function GoalCard({ goal, onStep, onDelete }) {
  const done = goal.progress >= goal.target
  const pct = Math.round((goal.progress / goal.target) * 100)
  return (
    <li className={cn('flex gap-5 rounded-panel border p-5 transition-colors', done ? 'border-sage-deep bg-sage/50' : 'border-line bg-surface shadow-xs')}>
      <ProgressRing value={goal.progress} max={goal.target} size={76} stroke={7} label={goal.title}>
        <span className="text-sm font-semibold tabular-nums">{pct}%</span>
      </ProgressRing>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{goal.title}</h3>
          <Menu items={[{ label: 'Hapus goal', icon: Trash2, danger: true, onSelect: () => onDelete(goal) }]} label={`Aksi untuk ${goal.title}`} className="-mr-2 -mt-1.5 size-8" />
        </div>
        <p className="mt-0.5 text-sm text-ink-2">
          <span className="font-semibold tabular-nums text-ink">{goal.progress}</span> dari {goal.target} {goal.unit === 'lainnya' ? 'langkah' : goal.unit}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          {goal.auto && <Badge tone="sage"><Sparkles aria-hidden="true" /> Otomatis</Badge>}
          {done && <Badge tone="success">Tercapai</Badge>}
          {!goal.auto && !done && (
            <div className="ml-auto flex items-center gap-1">
              <Button size="icon-sm" variant="secondary" aria-label={`Kurangi progres ${goal.title}`} disabled={goal.progress <= 0} onClick={() => onStep(goal, -1)}><Minus aria-hidden="true" /></Button>
              <Button size="sm" variant="secondary" onClick={() => onStep(goal, 1)}><Plus aria-hidden="true" /> Progres</Button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function GoalBoard({ resource, goals }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [period, setPeriod] = useState('daily')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', period: 'daily', target: '', unit: 'menit' })
  const [errors, setErrors] = useState({})

  const visible = goals.filter((g) => g.period === period)
  const setField = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))
  const replace = (goal) => resource.mutate((d) => ({ ...d, data: d.data.map((g) => (g.id === goal.id ? goal : g)) }))

  const step = async (goal, delta) => {
    try {
      const { data } = await api.patch(`/goals/${goal.id}`, { progress: Math.max(0, goal.progress + delta) })
      replace(data)
      if (data.progress >= data.target && delta > 0) toast.success('Goal tercapai', { description: data.title })
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const remove = async (goal) => {
    if (!(await confirm({ title: 'Hapus goal?', description: `"${goal.title}" akan dihapus beserta progresnya.`, confirmLabel: 'Hapus goal', tone: 'danger' }))) return
    try {
      await api.delete(`/goals/${goal.id}`)
      resource.mutate((d) => ({ ...d, data: d.data.filter((g) => g.id !== goal.id) }))
      toast.info('Goal dihapus')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const target = Number(form.target)
    const next = {}
    if (!form.title.trim()) next.title = 'Beri nama goal-mu.'
    if (!(target > 0)) next.target = 'Target harus lebih dari 0.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      const { data } = await api.post('/goals', { ...form, title: form.title.trim(), target })
      resource.mutate((d) => ({ ...d, data: [...d.data, data] }))
      setPeriod(form.period)
      setForm({ title: '', period: form.period, target: '', unit: 'menit' })
      setOpen(false)
      toast('Goal dibuat')
    } catch (error) {
      const f = fieldErrors(error)
      setErrors(Object.keys(f).length ? f : { title: errorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle="Target yang ingin kamu capai, dari kebiasaan harian sampai rencana semester."
        action={<Button onClick={() => { setForm((f) => ({ ...f, period })); setOpen(true) }}><Plus aria-hidden="true" /> Buat goal</Button>}
      />

      <SegmentedControl className="mb-6" label="Jenis goal" options={periods.map((p) => ({ ...p, count: goals.filter((g) => g.period === p.value).length }))} value={period} onChange={setPeriod} />

      {visible.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface">
          <EmptyState illustration="target" title="Belum ada goal di sini" description="Buat target supaya progresmu terarah." action={<Button variant="secondary" onClick={() => setOpen(true)}><Plus aria-hidden="true" /> Buat goal</Button>} />
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((g) => <GoalCard key={g.id} goal={g} onStep={step} onDelete={remove} />)}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Buat goal"
        description="Goal dengan satuan menit atau tugas diperbarui otomatis dari aktivitasmu."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" form="goal-form" loading={saving}>Simpan goal</Button></>}
      >
        <form id="goal-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Nama goal" required value={form.title} onChange={setField('title')} error={errors.title} maxLength={160} placeholder="mis. Belajar 10 jam minggu ini" autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Periode" options={periods} value={form.period} onChange={setField('period')} />
            <Select label="Diukur dari" options={unitOptions} value={form.unit} onChange={setField('unit')} />
          </div>
          <Input label="Target" required type="number" min={1} value={form.target} onChange={setField('target')} error={errors.target} placeholder={form.unit === 'menit' ? 'mis. 600' : 'mis. 5'} />
        </form>
      </Modal>
    </>
  )
}

export default function GoalsPage() {
  const resource = useResource('/goals')
  return <AsyncView resource={resource} skeleton="cards">{(page) => <GoalBoard resource={resource} goals={page.data} />}</AsyncView>
}
