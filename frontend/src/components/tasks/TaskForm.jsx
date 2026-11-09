import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'

import { priorityOptions } from '@/lib/taskMeta'

const empty = { title: '', course: '', due: '', priority: 'Sedang', description: '', attachment: '' }

// Dipasang dengan `key` berbeda per tugas, jadi state awal selalu sesuai tugas yang diedit.
export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...empty, ...initial })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Judul tugas wajib diisi.'
    if (!form.due) next.due = 'Pilih tanggal deadline.'
    setErrors(next)
    if (Object.keys(next).length === 0) onSubmit({ ...form, title: form.title.trim() })
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Judul tugas" value={form.title} onChange={set('title')} error={errors.title} maxLength={120} />
      <Input label="Mata pelajaran / mata kuliah" value={form.course} onChange={set('course')} maxLength={80} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Deadline" type="date" value={form.due} onChange={set('due')} error={errors.due} />
        <Select label="Prioritas" options={priorityOptions} value={form.priority} onChange={set('priority')} />
      </div>
      <Textarea label="Deskripsi (opsional)" value={form.description} onChange={set('description')} maxLength={500} />
      <Input
        label="Lampiran (opsional)"
        type="file"
        hint="Hanya nama file yang dicatat pada tampilan contoh ini."
        onChange={(e) => setForm((f) => ({ ...f, attachment: e.target.files?.[0]?.name ?? '' }))}
      />
      <div className="flex justify-end gap-3">
        <Button variant="neutral" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan tugas</Button>
      </div>
    </form>
  )
}
