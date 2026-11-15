import { useState } from 'react'
import { Download, Loader2, Paperclip } from 'lucide-react'
import FileIcon from '@/components/ui/FileIcon'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { formatSize } from '@/lib/files'
import Badge from '@/components/ui/Badge'
import { dueInfo } from '@/lib/date'
import { priorityMeta, statusMeta } from '@/lib/taskMeta'

const longFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function TaskDetail({ task }) {
  const toast = useToast()
  const [downloading, setDownloading] = useState(false)
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
        <AttachmentRow task={task} downloading={downloading} onDownload={async () => {
          setDownloading(true)
          try {
            const { data } = await api.get(`/tasks/${task.id}/attachment`, { responseType: 'blob' })
            const url = URL.createObjectURL(data)
            const a = document.createElement('a')
            a.href = url
            a.download = task.attachment
            document.body.append(a)
            a.click()
            a.remove()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          } catch (error) {
            toast(errorMessage(error, 'Lampiran tidak bisa diunduh.'), 'error')
          } finally {
            setDownloading(false)
          }
        }} />
      )}
    </div>
  )
}

function AttachmentRow({ task, downloading, onDownload }) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sage text-accent">
        {task.attachmentFile ? <FileIcon name={task.attachment} className="size-5" aria-hidden="true" /> : <Paperclip className="size-5" aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{task.attachment}</span>
        <span className="block text-xs text-ink-2">{task.attachmentFile ? formatSize(task.attachmentSize) : 'Hanya nama berkas, belum diunggah'}</span>
      </span>
      {task.attachmentFile && (downloading
        ? <Loader2 className="size-4.5 animate-spin text-muted" aria-hidden="true" />
        : <Download className="size-4.5 text-accent" aria-hidden="true" />)}
    </>
  )
  const cls = 'flex w-full items-center gap-3 rounded-control border border-line bg-canvas px-3 py-2.5 text-left'
  if (!task.attachmentFile) return <div className={cls}>{body}</div>
  return (
    <button type="button" onClick={onDownload} disabled={downloading} aria-label={`Unduh ${task.attachment}`} className={`${cls} transition-colors hover:border-accent/40 hover:bg-sage/30 active:bg-sage/50 disabled:opacity-70`}>
      {body}
    </button>
  )
}
