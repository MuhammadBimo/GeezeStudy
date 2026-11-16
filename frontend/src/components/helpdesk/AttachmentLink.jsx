import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import FileIcon from '@/components/ui/FileIcon'
import { useToast } from '@/hooks/useToast'
import { errorMessage } from '@/lib/api'
import { formatSize } from '@/lib/files'
import { downloadAttachment } from '@/lib/helpdesk'

/** Baris lampiran tiket; berkas privat diunduh lewat permintaan terautentikasi. */
export default function AttachmentLink({ path, name, size }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const download = async () => {
    setBusy(true)
    try {
      await downloadAttachment(path, name)
    } catch (error) {
      toast(errorMessage(error, 'Lampiran tidak bisa diunduh.'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" onClick={download} disabled={busy} className="flex w-full items-center gap-3 rounded-control border border-line bg-canvas px-3 py-2.5 text-left transition-colors hover:bg-hover">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sage text-accent"><FileIcon name={name} className="size-5" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{name}</span>
        <span className="block text-xs text-ink-2">{formatSize(size)} · Unduh lampiran</span>
      </span>
      {busy ? <Loader2 className="size-4.5 animate-spin text-muted" aria-hidden="true" /> : <Download className="size-4.5 text-accent" aria-hidden="true" />}
    </button>
  )
}
