import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { ListTodo, Plus, SearchX } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import TaskCard from '@/components/tasks/TaskCard'
import TaskForm from '@/components/tasks/TaskForm'
import { isoIn } from '@/lib/date'

// DATA SEMENTARA (mock): akan diganti dengan data dari API backend.
const initialTasks = [
  { id: 1, title: 'Laporan Praktikum Basis Data', course: 'Basis Data', due: isoIn(0), priority: 'Tinggi', status: 'progress', description: 'Bab normalisasi dan ERD.', attachment: '' },
  { id: 2, title: 'Rangkuman Bab 5', course: 'Jaringan Komputer', due: isoIn(1), priority: 'Sedang', status: 'todo', description: '', attachment: '' },
  { id: 3, title: 'Latihan Soal Kalkulus', course: 'Kalkulus', due: isoIn(3), priority: 'Rendah', status: 'todo', description: '', attachment: '' },
  { id: 4, title: 'Makalah Etika Profesi', course: 'Etika Profesi', due: isoIn(-2), priority: 'Tinggi', status: 'todo', description: 'Minimal 5 halaman.', attachment: '' },
  { id: 5, title: 'Baca jurnal UI/UX', course: 'Interaksi Manusia', due: isoIn(-1), priority: 'Rendah', status: 'done', description: '', attachment: 'jurnal.pdf' },
]

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'To Do' },
  { value: 'progress', label: 'In Progress' },
  { value: 'done', label: 'Completed' },
]

const nextStatus = { todo: 'progress', progress: 'done', done: 'todo' }

export default function TasksPage() {
  const toast = useToast()
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState('all')
  // editing: null (tutup) | 'new' | objek tugas
  const [editing, setEditing] = useState(null)

  const visible = tasks
    .filter((t) => filter === 'all' || t.status === filter)
    .toSorted((a, b) => a.due.localeCompare(b.due))

  const cycle = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus[t.status] } : t)))

  const remove = (task) => {
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    toast('Tugas dihapus')
  }

  const save = (data) => {
    if (editing === 'new') {
      setTasks((prev) => [...prev, { ...data, id: Date.now(), status: 'todo' }])
      toast('Tugas ditambahkan')
    } else {
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)))
      toast('Perubahan disimpan')
    }
    setEditing(null)
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

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Filter status" options={filters} value={filter} onChange={setFilter} />
        <Badge color="bg-yellow">Data contoh (sementara)</Badge>
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
              <TaskCard key={t.id} task={t} onCycle={cycle} onEdit={setEditing} onDelete={remove} />
            ))}
          </AnimatePresence>
        </ul>
      )}

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
