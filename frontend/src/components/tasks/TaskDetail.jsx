import { Paperclip } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { dueInfo } from '@/lib/date'
import { priorityMeta, statusMeta } from '@/lib/taskMeta'

const longFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function TaskDetail({ task }) {
  const done = task.status === 'done'
  const due = dueInfo(task.dueAt, done)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Badge tone={statusMeta[task.status].tone} dot>{statusMeta[task.status].label}</Badge>
        <Badge tone={priorityMeta[task.priority].tone}>Prioritas {task.priority.toLowerCase()}</Badge>
        {due.tone === 'danger' && <Badge tone="danger">Terlambat, tetap bisa diselesaikan</Badge>}
      </div>

      <dl className="grid gap-4 rounded-xl bg-canvas p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-2">Mata pelajaran</dt>
          <dd className="mt-0.5 font-medium">{task.course || 'Tanpa mata pelajaran'}</dd>
        </div>
        <div>
          <dt className="text-ink-2">Deadline</dt>
          <dd className="mt-0.5 font-medium">{task.dueAt ? longFmt.format(new Date(task.dueAt)) : 'Tanpa deadline'}</dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-medium text-ink-2">Catatan</h3>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed">{task.description || 'Belum ada catatan.'}</p>
      </div>

      {task.attachment && (
        <p className="inline-flex items-center gap-2 self-start rounded-lg border border-line px-3 py-2 text-sm">
          <Paperclip className="size-4 text-muted" aria-hidden="true" /> {task.attachment}
        </p>
      )}
    </div>
  )
}
