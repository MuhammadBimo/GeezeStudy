import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Pencil, Plus, Search } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import TaskCard from '@/components/tasks/TaskCard'
import TaskDetail from '@/components/tasks/TaskDetail'
import TaskForm from '@/components/tasks/TaskForm'
import UploadTray from '@/components/tasks/UploadTray'
import { useConfirm } from '@/hooks/useConfirm'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { TODAY, fromISO, toISO } from '@/lib/date'
import { statusToApi, taskFromApi, taskToApi } from '@/lib/mappers'

const nextStatus = { todo: 'progress', progress: 'done', done: 'todo' }

// Kelompok menurut tenggat, supaya yang paling mendesak selalu di atas.
function groupTasks(tasks) {
  const now = new Date()
  const weekEnd = toISO(new Date(fromISO(TODAY).getTime() + 7 * 86_400_000))
  const groups = { overdue: [], today: [], week: [], later: [], none: [], done: [] }
  for (const t of tasks) {
    if (t.status === 'done') groups.done.push(t)
    else if (!t.due) groups.none.push(t)
    else if (new Date(t.dueAt) < now) groups.overdue.push(t)
    else if (t.due === TODAY) groups.today.push(t)
    else if (t.due <= weekEnd) groups.week.push(t)
    else groups.later.push(t)
  }
  for (const k of Object.keys(groups)) groups[k].sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? ''))
  groups.done.reverse()
  return groups
}

const groupTitle = { overdue: 'Terlambat', today: 'Hari ini', week: '7 hari ke depan', later: 'Nanti', none: 'Tanpa deadline', done: 'Selesai' }

function TaskBoard({ resource, tasks }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('active')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(() => (params.get('baru') ? 'new' : null)) // null | 'new' | tugas
  const [viewing, setViewing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploads, setUploads] = useState([])
  const controllersRef = useRef(new Map())
  const viewed = viewing ? tasks.find((t) => t.id === viewing.id) : null

  const courses = useMemo(() => [...new Set(tasks.map((t) => t.course).filter(Boolean))], [tasks])
  const counts = {
    active: tasks.filter((t) => t.status !== 'done').length,
    progress: tasks.filter((t) => t.status === 'progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }
  const q = query.trim().toLowerCase()
  const visible = tasks.filter((t) => {
    const matchFilter = filter === 'all' || (filter === 'active' ? t.status !== 'done' : t.status === filter)
    const matchQuery = !q || t.title.toLowerCase().includes(q) || t.course.toLowerCase().includes(q)
    return matchFilter && matchQuery
  })
  const groups = groupTasks(visible)

  const replace = (apiTask) => resource.mutate((data) => ({ ...data, data: data.data.map((t) => (t.id === apiTask.id ? apiTask : t)) }))

  const setStatus = async (task, status) => {
    try {
      const { data } = await api.patch(`/tasks/${task.id}`, { status: statusToApi(status) })
      replace(data)
      if (status === 'done') toast.success('Tugas selesai', { description: 'Points ditambahkan ke akunmu.' })
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const remove = async (task) => {
    const ok = await confirm({ title: 'Hapus tugas ini?', description: `"${task.title}" akan dihapus permanen. Points yang sudah didapat tetap tersimpan.`, confirmLabel: 'Hapus tugas', tone: 'danger' })
    if (!ok) return
    try {
      await api.delete(`/tasks/${task.id}`)
      resource.mutate((data) => ({ ...data, data: data.data.filter((t) => t.id !== task.id) }))
      toast.info('Tugas dihapus')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const closeForm = () => {
    setEditing(null)
    if (params.get('baru')) setParams({}, { replace: true })
  }

  const patchUpload = (id, patch) => setUploads((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)))

  const cancelUpload = (id) => {
    const controller = controllersRef.current.get(id)
    if (controller) {
      controller.abort()
      controllersRef.current.delete(id)
    }
    patchUpload(id, { status: 'cancelled' })
  }

  const cancelAllUploads = () => {
    for (const [id, controller] of controllersRef.current.entries()) {
      controller.abort()
      controllersRef.current.delete(id)
      patchUpload(id, { status: 'cancelled' })
    }
  }

  const uploadAttachment = (savedTask, file) => {
    const id = `${savedTask.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const controller = new AbortController()
    controllersRef.current.set(id, controller)
    const startedAt = Date.now()

    setUploads((list) => [
      {
        id,
        taskId: savedTask.id,
        taskTitle: savedTask.title,
        taskCourse: savedTask.course || '',
        fileName: file.name,
        fileSize: file.size,
        startedAt,
        progress: 0,
        etaSeconds: null,
        status: 'uploading',
        error: '',
      },
      ...list.filter((item) => item.status === 'uploading' || item.taskId !== savedTask.id),
    ])

    const body = new FormData()
    body.append('file', file)

    api
      .post(`/tasks/${savedTask.id}/attachment`, body, {
        signal: controller.signal,
        onUploadProgress: (event) => {
          const total = event.total || file.size
          if (!total) return
          const ratio = Math.min(1, event.loaded / total)
          // Maksimal 99% selama transfer browser→backend; 100% baru saat backend selesai menyimpan ke S3.
          const progress = Math.min(99, Math.round(ratio * 99))
          const elapsed = Math.max(0.05, (Date.now() - startedAt) / 1000)
          const rate = event.rate || (event.loaded / elapsed)
          const etaSeconds = typeof event.estimated === 'number' && Number.isFinite(event.estimated)
            ? Math.max(1, event.estimated)
            : rate > 0
              ? Math.max(1, (total - event.loaded) / rate)
              : null
          patchUpload(id, { progress, etaSeconds })
        },
      })
      .then(({ data }) => {
        controllersRef.current.delete(id)
        replace(data)
        patchUpload(id, { progress: 100, etaSeconds: 0, status: 'done' })
      })
      .catch((error) => {
        controllersRef.current.delete(id)
        if (error?.code === 'ERR_CANCELED' || controller.signal.aborted) {
          patchUpload(id, { status: 'cancelled' })
          return
        }
        const msg = errorMessage(error)
        patchUpload(id, { status: 'error', error: msg })
        toast.error(`Lampiran "${savedTask.title}" gagal diunggah`, { description: msg })
      })
  }

  const save = async (form) => {
    setSaving(true)
    const isNew = editing === 'new'
    const hadAttachment = !isNew && Boolean(editing.attachment)
    let saved = null
    try {
      saved = (isNew ? await api.post('/tasks', taskToApi(form)) : await api.patch(`/tasks/${editing.id}`, taskToApi(form))).data
      if (isNew) resource.mutate((d) => ({ ...d, data: [...d.data, saved] }))
      else replace(saved)
    } catch (error) {
      toast(errorMessage(error), 'error')
      setSaving(false)
      return
    }

    if (form.file) {
      setSaving(false)
      closeForm()
      toast(isNew ? 'Tugas ditambahkan, mengunggah lampiran...' : 'Perubahan disimpan, mengunggah lampiran...')
      uploadAttachment(saved, form.file)
      return
    }

    try {
      if (form.clearAttachment && hadAttachment) {
        const { data } = await api.delete(`/tasks/${saved.id}/attachment`)
        replace(data)
      }
      toast(isNew ? 'Tugas ditambahkan' : 'Perubahan disimpan')
    } catch (error) {
      toast.error('Tugas tersimpan, tapi lampiran gagal dihapus', { description: errorMessage(error) })
    } finally {
      setSaving(false)
      closeForm()
    }
  }

  const rowProps = { onCycle: (t) => setStatus(t, nextStatus[t.status]), onSetStatus: setStatus, onOpen: setViewing, onEdit: setEditing, onDelete: remove }

  return (
    <>
      <PageHeader
        title="Tugas"
        subtitle="Catat tugas dari sekolah atau LMS, atur deadline, dan pantau sampai selesai."
        action={<Button onClick={() => setEditing('new')}><Plus aria-hidden="true" /> Tambah tugas</Button>}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Filter tugas"
          options={[
            { value: 'active', label: 'Aktif', count: counts.active },
            { value: 'progress', label: 'Dikerjakan', count: counts.progress },
            { value: 'done', label: 'Selesai', count: counts.done },
            { value: 'all', label: 'Semua' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <Input labelHidden label="Cari tugas" icon={Search} type="search" placeholder="Cari judul atau mata pelajaran" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:w-72" />
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface">
          <EmptyState illustration="tasks" title="Belum ada tugas" description="Tambahkan tugas pertamamu supaya deadline tidak terlewat." action={<Button onClick={() => setEditing('new')}><Plus aria-hidden="true" /> Tambah tugas</Button>} />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface">
          <EmptyState illustration="search" title="Tidak ada tugas yang cocok" description={q ? `Tidak ada hasil untuk "${query.trim()}".` : 'Coba pilih filter lain.'} />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).filter(([, list]) => list.length > 0).map(([key, list]) => (
            <section key={key} aria-labelledby={`group-${key}`}>
              <h2 id={`group-${key}`} className={`mb-2 flex items-center gap-2 text-sm font-semibold ${key === 'overdue' ? 'text-danger' : 'text-ink'}`}>
                {groupTitle[key]} <span className="font-normal text-muted">{list.length}</span>
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs">
                <AnimatePresence initial={false}>
                  {list.map((t) => <TaskCard key={t.id} task={t} {...rowProps} />)}
                </AnimatePresence>
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(viewed)}
        onClose={() => setViewing(null)}
        title={viewed?.title ?? 'Detail tugas'}
        footer={viewed && (
          <>
            <Button variant="secondary" onClick={() => setViewing(null)}>Tutup</Button>
            <Button onClick={() => { const t = viewed; setViewing(null); setEditing(t) }}><Pencil aria-hidden="true" /> Ubah tugas</Button>
          </>
        )}
      >
        {viewed && <TaskDetail task={viewed} />}
      </Modal>

      <Modal
        open={editing !== null}
        onClose={closeForm}
        title={editing === 'new' ? 'Tambah tugas' : 'Ubah tugas'}
        description={editing === 'new' ? 'Isi judul dan deadline; sisanya opsional.' : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" form="task-form" loading={saving}>{editing === 'new' ? 'Simpan tugas' : 'Simpan perubahan'}</Button>
          </>
        }
      >
        {editing !== null && (
          <TaskForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? undefined : editing} courses={courses} onSubmit={save} />
        )}
      </Modal>

      <UploadTray
        items={uploads}
        onCancel={cancelUpload}
        onCancelAll={cancelAllUploads}
        onDismiss={() => setUploads([])}
      />
    </>
  )
}

export default function TasksPage() {
  const resource = useResource('/tasks')
  return (
    <AsyncView resource={resource} rows={5}>
      {(page) => <TaskBoard resource={resource} tasks={page.data.map(taskFromApi)} />}
    </AsyncView>
  )
}
