import { Check, Paperclip, Pencil, Trash2, Loader } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { TODAY, formatShort } from '@/lib/date'

import { priorityColor, statusMeta } from '@/lib/taskMeta'

export default function TaskCard({ task, onCycle, onEdit, onDelete }) {
  const overdue = task.status !== 'done' && task.due < TODAY
  const meta = statusMeta[task.status]

  return (
    <li className="flex items-start gap-3 rounded-brutal border-2 border-ink bg-surface p-4 shadow-brutal-sm">
      <button
        type="button"
        onClick={() => onCycle(task.id)}
        aria-label={`Status ${meta.label}. Ubah status: ${task.title}`}
        className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border-2 border-ink', meta.color)}
      >
        {task.status === 'done' && <Check className="size-5" strokeWidth={3} aria-hidden="true" />}
        {task.status === 'progress' && <Loader className="size-4" aria-hidden="true" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('font-bold leading-snug', task.status === 'done' && 'line-through opacity-60')}>{task.title}</p>
        <p className="text-sm text-ink/70">{task.course || 'Tanpa mata kuliah'}</p>
        {task.description && <p className="mt-1 line-clamp-2 text-sm">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
          <Badge color={meta.color}>{meta.label}</Badge>
          <span className={cn('text-sm font-bold', overdue && 'text-danger')}>
            {overdue ? 'Terlambat · ' : 'Deadline '}
            {formatShort(task.due)}
          </span>
          {task.attachment && (
            <span className="inline-flex items-center gap-1 text-sm text-ink/70">
              <Paperclip className="size-3.5" aria-hidden="true" /> {task.attachment}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={() => onEdit(task)} aria-label={`Ubah ${task.title}`} className="grid size-9 place-items-center rounded-md border-2 border-transparent hover:border-ink hover:bg-yellow">
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onDelete(task)} aria-label={`Hapus ${task.title}`} className="grid size-9 place-items-center rounded-md border-2 border-transparent hover:border-ink hover:bg-pink">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}
