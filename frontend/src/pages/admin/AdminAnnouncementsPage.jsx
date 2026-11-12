import { useState } from 'react'
import { Megaphone, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useToast } from '@/hooks/useToast'

const targets = [
  { value: 'all', label: 'Semua pengguna' },
  { value: 'sd-smp', label: 'SD dan SMP' },
  { value: 'sma', label: 'SMA / SMK' },
  { value: 'college', label: 'Mahasiswa' },
]
const targetLabel = Object.fromEntries(targets.map((t) => [t.value, t.label]))

export default function AdminAnnouncementsPage() {
  const toast = useToast()
  const { items, add, remove } = useAnnouncements()
  const [form, setForm] = useState({ title: '', body: '', target: 'all' })
  const [errors, setErrors] = useState({})

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Judul wajib diisi.'
    if (!form.body.trim()) next.body = 'Isi pengumuman wajib diisi.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    add({ ...form, title: form.title.trim(), body: form.body.trim() })
    setForm({ title: '', body: '', target: 'all' })
    toast('Pengumuman diterbitkan. Cek di Dashboard Student.')
  }

  return (
    <>
      <PageHeader title="Pengumuman" subtitle="Pesan dari Admin akan muncul di Dashboard pengguna." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="primary" color="bg-sand-deep" className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Megaphone className="size-5" aria-hidden="true" /> Buat pengumuman
          </h2>
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <Input label="Judul" value={form.title} onChange={set('title')} error={errors.title} maxLength={80} />
            <div>
              <Textarea label="Isi" value={form.body} onChange={set('body')} maxLength={300} />
              {errors.body && <p role="alert" className="mt-1 text-sm font-semibold text-danger">{errors.body}</p>}
            </div>
            <Select label="Ditujukan untuk" options={targets} value={form.target} onChange={set('target')} />
            <Button type="submit" className="self-start">Terbitkan</Button>
          </form>
        </Card>

        <div>
          <h2 className="mb-3 text-xl font-semibold">Pengumuman aktif ({items.length})</h2>
          {items.length === 0 ? (
            <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Buat pengumuman pertama di sebelah." />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((a) => (
                <Card as="li" key={a.id} className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-medium leading-tight">{a.title}</p>
                    <p className="mt-1 text-sm">{a.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/80">
                      <Badge color="bg-mist">{targetLabel[a.target]}</Badge>
                      {a.createdAt}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { remove(a.id); toast('Pengumuman dihapus') }}
                    aria-label={`Hapus pengumuman: ${a.title}`}
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-transparent hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
