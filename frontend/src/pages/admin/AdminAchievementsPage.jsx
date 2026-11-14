import { useState } from 'react'
import { Award, Pencil, Plus, Trash2 } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { useResource } from '@/hooks/useResource'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'

const metricOptions = [
  { value: 'tasks_completed', label: 'Jumlah tugas selesai' },
  { value: 'study_minutes', label: 'Total menit belajar' },
  { value: 'best_streak', label: 'Streak terbaik (hari)' },
  { value: 'level', label: 'Level yang dicapai' },
]
const blank = { title: '', description: '', metric: 'tasks_completed', threshold: '1', reward_points: '10' }

function AchievementAdmin({ resource, items }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const open = (a) => {
    setError('')
    setForm(a === 'new' ? blank : { title: a.title, description: a.description, metric: a.metric, threshold: String(a.threshold), reward_points: String(a.reward_points) })
    setEditing(a)
  }
  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const threshold = Number(form.threshold)
    const reward = Number(form.reward_points)
    if (!form.title.trim() || !form.description.trim()) return setError('Nama dan deskripsi wajib diisi.')
    if (!(threshold > 0) || !(reward >= 0)) return setError('Target harus lebih dari 0 dan bonus tidak boleh negatif.')

    setSaving(true)
    try {
      const body = { ...form, title: form.title.trim(), description: form.description.trim(), threshold, reward_points: reward }
      if (editing === 'new') await api.post('/admin/achievements', body)
      else await api.patch(`/admin/achievements/${editing.id}`, body)
      toast(editing === 'new' ? 'Achievement dibuat' : 'Achievement diperbarui')
      setEditing(null)
      resource.reload()
    } catch (err) {
      setError(Object.values(fieldErrors(err))[0] ?? errorMessage(err))
    } finally {
      setSaving(false)
    }
    return undefined
  }

  const toggle = async (a, active) => {
    try {
      await api.patch(`/admin/achievements/${a.id}`, { active })
      toast(active ? 'Achievement diaktifkan' : 'Achievement dinonaktifkan')
      resource.reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const remove = async (a) => {
    if (!(await confirm({ title: 'Hapus achievement?', description: `Hapus achievement "${a.title}"? Pengguna yang sudah membukanya kehilangan badge ini.`, confirmLabel: 'Hapus', tone: 'danger' }))) return
    try {
      await api.delete(`/admin/achievements/${a.id}`)
      toast('Achievement dihapus')
      resource.reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" /> Achievement baru</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Award} title="Belum ada achievement" description="Buat badge pertama untuk Student." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <Card as="li" key={a.id} color={a.active ? 'bg-surface' : 'bg-canvas'} className="flex flex-col gap-3 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-clay">
                  <Award className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-medium leading-tight">{a.title}</h2>
                  <p className="text-sm text-ink/80">{a.description}</p>
                </div>
                <Toggle label={`Aktifkan achievement ${a.title}`} checked={a.active} onChange={(v) => toggle(a, v)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color="bg-mist">{metricOptions.find((o) => o.value === a.metric)?.label}: {a.threshold}</Badge>
                <Badge color="bg-moss">Bonus +{a.reward_points} pts</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="neutral" onClick={() => open(a)}>
                  <Pencil className="size-4" aria-hidden="true" /> Ubah
                </Button>
                <Button size="sm" variant="neutral" onClick={() => remove(a)} aria-label={`Hapus achievement ${a.title}`}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Modal
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button><Button type="submit" form="achievement-form" loading={saving}>Simpan achievement</Button></>}
        open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Achievement baru' : 'Ubah achievement'}>
        <form id="achievement-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Nama" value={form.title} onChange={set('title')} error={error} maxLength={60} />
          <Input label="Deskripsi" value={form.description} onChange={set('description')} maxLength={120} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Syarat diukur dari" options={metricOptions} value={form.metric} onChange={set('metric')} />
            <Input label="Target" type="number" min={1} value={form.threshold} onChange={set('threshold')} />
          </div>
          <Input label="Bonus Points" type="number" min={0} value={form.reward_points} onChange={set('reward_points')} />
        </form>
      </Modal>
    </>
  )
}

export default function AdminAchievementsPage() {
  const resource = useResource('/admin/achievements')
  return (
    <>
      <PageHeader title="Achievements" subtitle="Atur badge dan syarat untuk membukanya." />
      <AsyncView resource={resource}>{(page) => <AchievementAdmin resource={resource} items={page.data} />}</AsyncView>
    </>
  )
}
