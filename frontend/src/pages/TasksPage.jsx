import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { ListTodo, Plus, SearchX } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useResource } from '@/hooks/useResource'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import TaskCard from '@/components/tasks/TaskCard'
import TaskDetail from '@/components/tasks/TaskDetail'
import TaskForm from '@/components/tasks/TaskForm'
import { api, errorMessage } from '@/lib/api'
import { statusToApi, taskFromApi, taskToApi } from '@/lib/mappers'

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'To Do' },
  { value: 'progress', label: 'In Progress' },
  { value: 'done', label: 'Completed' },
]

const nextStatus = { todo: 'progress', progress: 'done', done: 'todo' }

function TaskBoard({ resource, tasks }) {
  const toast = useToast()
  const { mutate } = resource
  const [filter, setFilter] = useState('all')
  // editing: null (tutup) | 'new' | objek tugas
  const [editing, setEditing] = useState(null)
  // viewing: null | objek tugas yang detailnya sedang dibuka
  const [viewing, setViewing] = useState(null)
  const viewed = viewing ? tasks.find((t) => t.id === viewing.id) : null

  const visible = tasks
    .filter((t) => filter === 'all' || t.status === filter)
    .toSorted((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))

  const replace = (apiTask) =>
    mutate((data) => ({ ...data, data: data.data.map((t) => (t.id === apiTask.id ? apiTask : t)) }))

  const cycle = async (id) => {
    const task = tasks.find((t) => t.id === id)
    try {
      const { data } = await api.patch(`/tasks/${id}`, { status: statusToApi(nextStatus[task.status]) })
      replace(data)
      if (data.status === 'completed') toast('Tugas selesai. Points ditambahkan!')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const remove = async (task) => {
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return
    try {
      await api.delete(`/tasks/${task.id}`)
      mutate((data) => ({ ...data, data: data.data.filter((t) => t.id !== task.id) }))
      toast('Tugas dihapus')
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  // Mengembalikan galat ke form agar pesannya tampil di kolom yang tepat.
  const save = async (form) => {
    try {
      if (editing === 'new') {
        const { data } = await api.post('/tasks', taskToApi(form))
        mutate((d) => ({ ...d, data: [...d.data, data] }))
        toast('Tugas ditambahkan')
      } else {
        const { data } = await api.patch(`/tasks/${editing.id}`, taskToApi(form))
        replace(data)
        toast('Perubahan disimpan')
      }
      setEditing(null)
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Tugas"
        subtitle="Catat tugas dari LMS-mu, atur deadline, dan pantau progresnya."
        action={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" /> Tambah tugas
          </Button>
        }
      />

      <div className="mb-5">
        <SegmentedControl label="Filter status" options={filters} value={filter} onChange={setFilter} />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Belum ada tugas"
          description="Tambahkan tugas pertamamu supaya deadline tidak terlewat."
          action={<Button onClick={() => setEditing('new')}>Tambah tugas</Button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={SearchX} title="Tidak ada tugas di filter ini" description="Coba pilih status lain." />
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {visible.map((t) => (
              <TaskCard key={t.id} task={t} onCycle={cycle} onOpen={setViewing} onEdit={setEditing} onDelete={remove} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Modal open={viewed !== null && viewed !== undefined} onClose={() => setViewing(null)} title={viewed?.title ?? 'Detail tugas'}>
        {viewed && (
          <TaskDetail
            task={viewed}
            onClose={() => setViewing(null)}
            onEdit={(t) => { setViewing(null); setEditing(t) }}
          />
        )}
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Tambah tugas' : 'Ubah tugas'}>
        {editing !== null && (
          <TaskForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  )
}

export default function TasksPage() {
  const resource = useResource('/tasks')
  return (
    <AsyncView resource={resource}>
      {(page) => <TaskBoard resource={resource} tasks={page.data.map(taskFromApi)} />}
    </AsyncView>
  )
}
