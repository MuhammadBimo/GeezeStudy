import { m } from 'motion/react'
import { Check, CircleDot, Paperclip, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Menu, { ContextMenu } from '@/components/ui/Menu'
import { cn } from '@/lib/cn'
import { dueInfo } from '@/lib/date'
import { priorityMeta, statusMeta } from '@/lib/taskMeta'

const toneText = { danger: 'text-danger font-medium', warning: 'text-warning font-medium', neutral: 'text-ink-2' }

// Satu baris tugas: tombol status, judul (buka detail), mata pelajaran, tenggat, prioritas, menu aksi.
export default function TaskCard({ task, onCycle, onSetStatus, onOpen, onEdit, onDelete }) {
  const done = task.status === 'done'
  const due = dueInfo(task.dueAt, done)
  const meta = statusMeta[task.status]

  const items = [
    { label: 'Ubah', icon: Pencil, onSelect: () => onEdit(task) },
    done
      ? { label: 'Buka lagi', icon: RotateCcw, onSelect: () => onSetStatus(task, 'todo') }
      : { label: 'Tandai selesai', icon: Check, onSelect: () => onSetStatus(task, 'done') },
    ...(task.status === 'todo' ? [{ label: 'Mulai kerjakan', icon: CircleDot, onSelect: () => onSetStatus(task, 'progress') }] : []),
    '-',
    { label: 'Hapus', icon: Trash2, danger: true, onSelect: () => onDelete(task) },
  ]

  return (
    <m.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
      <ContextMenu items={items} className="group flex items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-canvas/70 sm:px-5">
        <button
          type="button"
          onClick={() => onCycle(task)}
          aria-label={`Status: ${meta.label}. Ubah status ${task.title}`}
          className={cn(
            'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-all active:scale-90',
            done ? 'border-forest bg-forest text-surface' : task.status === 'progress' ? 'border-info bg-info-soft text-info' : 'border-line-strong hover:border-forest hover:bg-sage',
          )}
        >
          {done && <Check className="size-3.5 animate-pop" strokeWidth={3} aria-hidden="true" />}
          {task.status === 'progress' && <span className="size-2 rounded-full bg-info" aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onOpen(task)}
            className={cn('text-left font-medium leading-snug decoration-line-strong underline-offset-4 hover:underline', done && 'text-ink-2 line-through')}
          >
            {task.title}
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem]">
            <span className="text-ink-2">{task.course || 'Tanpa mata pelajaran'}</span>
            <span className={toneText[due.tone]}>{due.text}</span>
            {task.attachment && <span className="inline-flex items-center gap-1 text-ink-2"><Paperclip className="size-3" aria-hidden="true" />{task.attachment}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {task.status === 'progress' && <Badge tone="info" className="hidden sm:inline-flex">Dikerjakan</Badge>}
          {!done && <Badge tone={priorityMeta[task.priority].tone} dot className="hidden sm:inline-flex">{task.priority}</Badge>}
          <Menu items={items} label={`Aksi untuk ${task.title}`} />
        </div>
      </ContextMenu>
    </m.li>
  )
}
