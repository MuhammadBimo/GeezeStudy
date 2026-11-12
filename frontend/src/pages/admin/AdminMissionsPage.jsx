import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'

const periodOptions = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
]
const metricOptions = [
  { value: 'tasks_completed', label: 'Jumlah tugas selesai' },
  { value: 'study_minutes', label: 'Menit belajar' },
]
const blank = { title: '', type: 'daily', metric: 'tasks_completed', target: '1', reward_points: '10' }

function MissionAdmin({ resource, missions }) {
  const toast = useToast()
  const [editing, setEditing] = useState(null) // null | 'new' | misi
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const open = (m) => {
    setError('')
    setForm(m === 'new' ? blank : { title: m.title, type: m.type, metric: m.metric, target: String(m.target), reward_points: String(m.reward_points) })
    setEditing(m)
  }
  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const target = Number(form.target)
    const reward = Number(form.reward_points)
    if (!form.title.trim()) return setError('Judul misi wajib diisi.')
    if (!(target > 0) || !(reward >= 0)) return setError('Target harus lebih dari 0 dan reward tidak boleh negatif.')

    setSaving(true)
    try {
      const body = { ...form, title: form.title.trim(), target, reward_points: reward }
      if (editing === 'new') await api.post('/admin/missions', body)
      else await api.patch(`/admin/missions/${editing.id}`, body)
      toast(editing === 'new' ? 'Misi dibuat' : 'Misi diperbarui')
      setEditing(null)
      resource.reload()
    } catch (err) {
      const fields = fieldErrors(err)
      setError(Object.values(fields)[0] ?? errorMessage(err))
    } finally {
      setSaving(false)
    }
    return undefined
  }

  const toggle = async (m, active) => {
    try {
      await api.patch(`/admin/missions/${m.id}`, { active })
      toast(active ? 'Misi diaktifkan' : 'Misi dinonaktifkan')
      resource.reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const remove = async (m) => {
    if (!window.confirm(`Hapus misi "${m.title}"? Klaim yang sudah ada ikut terhapus.`)) return
    try {
      await api.delete(`/admin/missions/${m.id}`)
      toast('Misi dihapus')
      resource.reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" /> Misi baru</Button>
      </div>
      {missions.length === 0 ? (
        <EmptyState title="Belum ada misi" description="Buat misi pertama untuk Student." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {missions.map((m) => (
            <Card as="li" key={m.id} color={m.active ? 'bg-surface' : 'bg-canvas'} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold leading-snug">{m.title}</h2>
                <Toggle label={`Aktifkan misi ${m.title}`} checked={m.active} onChange={(v) => toggle(m, v)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color={m.type === 'daily' ? 'bg-forest-tint' : 'bg-sand-deep'}>{m.type === 'daily' ? 'Harian' : 'Mingguan'}</Badge>
                <Badge color="bg-mist">{metricOptions.find((o) => o.value === m.metric)?.label}: {m.target}</Badge>
                <Badge color="bg-moss">+{m.reward_points} pts</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="neutral" onClick={() => open(m)}>
                  <Pencil className="size-4" aria-hidden="true" /> Ubah
                </Button>
                <Button size="sm" variant="neutral" onClick={() => remove(m)} aria-label={`Hapus misi ${m.title}`}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Misi baru' : 'Ubah misi'}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Input label="Judul misi" value={form.title} onChange={set('title')} error={error} maxLength={100} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Periode" options={periodOptions} value={form.type} onChange={set('type')} />
            <Select label="Diukur dari" options={metricOptions} value={form.metric} onChange={set('metric')} />
            <Input label="Target" type="number" min={1} value={form.target} onChange={set('target')} />
            <Input label="Reward (Points)" type="number" min={0} value={form.reward_points} onChange={set('reward_points')} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setEditing(null)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan misi</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default function AdminMissionsPage() {
  const resource = useResource('/admin/missions')

  return (
    <>
      <PageHeader title="Misi" subtitle="Atur tantangan harian dan mingguan untuk Student." />
      <AsyncView resource={resource}>
        {(page) => <MissionAdmin resource={resource} missions={page.data} />}
      </AsyncView>
    </>
  )
}
