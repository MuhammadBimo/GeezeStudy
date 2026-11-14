import { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { priorityOptions } from '@/lib/taskMeta'

const empty = { title: '', course: '', due: '', priority: 'Sedang', description: '', attachment: '' }

// Form tanpa tombol: tombol simpan ada di footer modal dan terhubung lewat atribut form="task-form".
export default function TaskForm({ initial, courses = [], onSubmit }) {
  const [form, setForm] = useState({ ...empty, ...initial })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Judul tugas wajib diisi.'
    if (!form.due) next.due = 'Pilih tanggal deadline.'
    setErrors(next)
    if (Object.keys(next).length === 0) onSubmit({ ...form, title: form.title.trim(), course: form.course.trim() })
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
      <Input label="Nama lampiran" value={form.attachment} onChange={set('attachment')} maxLength={160} placeholder="mis. modul-7.pdf" hint="Unggah berkas belum tersedia; catat nama berkasnya agar mudah dicari." />
    </form>
  )
}
