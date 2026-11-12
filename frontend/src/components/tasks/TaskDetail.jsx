import { Paperclip } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { priorityColor, statusMeta } from '@/lib/taskMeta'
import { TODAY, formatLong } from '@/lib/date'

export default function TaskDetail({ task, onEdit, onClose }) {
  const overdue = task.status !== 'done' && task.due < TODAY
  const meta = statusMeta[task.status]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge color={priorityColor[task.priority]}>Prioritas {task.priority}</Badge>
        <Badge color={meta.color}>{meta.label}</Badge>
        {overdue && <Badge color="bg-danger text-white">Terlambat, tetap bisa diselesaikan</Badge>}
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-bold text-ink/70">Mata kuliah / pelajaran</dt>
          <dd className="font-medium">{task.course || 'Tanpa mata kuliah'}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink/70">Deadline</dt>
          <dd className="font-medium">{formatLong(task.due)}</dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-bold text-ink/70">Deskripsi</h3>
        <p className="mt-1 whitespace-pre-wrap">{task.description || 'Tidak ada deskripsi.'}</p>
      </div>

      {task.attachment && (
        <p className="inline-flex items-center gap-2 rounded-brutal border-2 border-ink bg-surface px-3 py-2 text-sm font-medium">
          <Paperclip className="size-4" aria-hidden="true" /> {task.attachment}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="neutral" onClick={onClose}>Tutup</Button>
        <Button onClick={() => onEdit(task)}>Ubah tugas</Button>
      </div>
    </div>
  )
}
