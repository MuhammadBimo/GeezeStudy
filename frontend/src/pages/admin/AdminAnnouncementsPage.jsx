import { useState } from 'react'
import { Megaphone, Trash2 } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import Textarea from '@/components/ui/Textarea'
import { useResource } from '@/hooks/useResource'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { relativeTime } from '@/lib/mappers'

function AnnouncementAdmin({ resource, items }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [form, setForm] = useState({ title: '', body: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Judul wajib diisi.'
    if (!form.body.trim()) next.body = 'Isi pengumuman wajib diisi.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    try {
      await api.post('/admin/announcements', { title: form.title.trim(), body: form.body.trim() })
      setForm({ title: '', body: '' })
      toast('Pengumuman diterbitkan. Student melihatnya di Dashboard.')
      resource.reload()
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { title: errorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (a) => {
    if (!(await confirm({ title: 'Hapus pengumuman?', description: `Hapus pengumuman "${a.title}"?`, confirmLabel: 'Hapus', tone: 'danger' }))) return
    try {
      await api.delete(`/admin/announcements/${a.id}`)
      toast('Pengumuman dihapus')
      resource.reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  return (
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
          <Button type="submit" className="self-start" loading={saving}>Terbitkan</Button>
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
                  <p className="mt-2 text-xs text-ink/80">{relativeTime(a.published_at ?? a.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(a)}
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
  )
}

export default function AdminAnnouncementsPage() {
  const resource = useResource('/admin/announcements')
  return (
    <>
      <PageHeader title="Pengumuman" subtitle="Pesan dari Admin akan muncul di Dashboard semua Student." />
      <AsyncView resource={resource} rows={2}>{(page) => <AnnouncementAdmin resource={resource} items={page.data} />}</AsyncView>
    </>
  )
}
