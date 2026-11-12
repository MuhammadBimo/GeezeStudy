import { m } from 'motion/react'
import { Check, Paperclip, Pencil, Trash2, Loader } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { TODAY, formatShort } from '@/lib/date'

import { priorityColor, statusMeta } from '@/lib/taskMeta'

export default function TaskCard({ task, onCycle, onOpen, onEdit, onDelete }) {
  const overdue = task.status !== 'done' && task.due < TODAY
  const meta = statusMeta[task.status]

  return (
    <m.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 rounded-panel border border-line bg-surface p-4 shadow-soft-sm"
    >
      <button
        type="button"
        onClick={() => onCycle(task.id)}
        aria-label={`Status ${meta.label}. Ubah status: ${task.title}`}
        className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-line transition-all duration-150 active:scale-90 motion-reduce:transition-none', meta.color)}
      >
        {task.status === 'done' && <Check className="size-5 animate-pop" strokeWidth={3} aria-hidden="true" />}
        {task.status === 'progress' && <Loader className="size-4" aria-hidden="true" />}
      </button>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpen(task)}
          aria-label={`Lihat detail: ${task.title}`}
          className={cn('text-left font-semibold leading-snug underline-offset-4 hover:underline', task.status === 'done' && 'line-through text-ink/80')}
        >
          {task.title}
        </button>
        <p className="text-sm text-ink/80">{task.course || 'Tanpa mata kuliah'}</p>
        {task.description && <p className="mt-1 line-clamp-2 text-sm">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
          <Badge color={meta.color}>{meta.label}</Badge>
          <span className={cn('text-sm font-semibold', overdue && 'text-danger')}>
            {overdue ? 'Terlambat · ' : 'Deadline '}
            {formatShort(task.due)}
          </span>
          {task.attachment && (
            <span className="inline-flex items-center gap-1 text-sm text-ink/80">
              <Paperclip className="size-3.5" aria-hidden="true" /> {task.attachment}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={() => onEdit(task)} aria-label={`Ubah ${task.title}`} className="grid size-9 place-items-center rounded-md border border-transparent hover:border-line hover:bg-sand-deep">
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onDelete(task)} aria-label={`Hapus ${task.title}`} className="grid size-9 place-items-center rounded-md border border-transparent hover:bg-danger/10 hover:text-danger">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </m.li>
  )
}
