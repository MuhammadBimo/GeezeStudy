import { useState } from 'react'
import AttachmentField from '@/components/tasks/AttachmentField'
import DatePicker from '@/components/ui/DatePicker'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { priorityOptions } from '@/lib/taskMeta'

const empty = { title: '', course: '', due: '', priority: 'Sedang', description: '' }

// Form tanpa tombol: tombol simpan ada di footer modal dan terhubung lewat atribut form="task-form".
export default function TaskForm({ initial, courses = [], onSubmit }) {
  const [form, setForm] = useState({ ...empty, ...initial })
  const [errors, setErrors] = useState({})
  // Lampiran: berkas baru (diunggah setelah tugas disimpan) atau tanda hapus lampiran lama.
  const [file, setFile] = useState(null)
  const [clearAttachment, setClearAttachment] = useState(false)
  const current = !clearAttachment && initial?.attachment ? { name: initial.attachment, size: initial.attachmentSize } : null

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Judul tugas wajib diisi.'
    if (!form.due) next.due = 'Pilih tanggal deadline.'
    setErrors(next)
    if (Object.keys(next).length === 0) onSubmit({ ...form, title: form.title.trim(), course: form.course.trim(), file, clearAttachment: clearAttachment && !file })
  }

  return (
    <form id="task-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Judul tugas" required value={form.title} onChange={set('title')} error={errors.title} maxLength={160} placeholder="mis. Laporan praktikum modul 7" autoFocus />
      <Input label="Mata pelajaran / mata kuliah" value={form.course} onChange={set('course')} maxLength={120} list="course-suggestions" placeholder="mis. Basis Data" />
      <datalist id="course-suggestions">{courses.map((c) => <option key={c} value={c} />)}</datalist>
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker label="Deadline" required value={form.due} onChange={set('due')} error={errors.due} />
        <Select label="Prioritas" options={priorityOptions} value={form.priority} onChange={set('priority')} />
      </div>
      <Textarea label="Catatan" value={form.description} onChange={set('description')} maxLength={2000} placeholder="Instruksi, halaman buku, atau tautan LMS" />
      <AttachmentField
        current={current}
        file={file}
        onChange={(f) => { setFile(f); setClearAttachment(true) }}
        onRemove={() => { setFile(null); setClearAttachment(true) }}
      />
    </form>
  )
}
