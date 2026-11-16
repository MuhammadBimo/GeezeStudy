import { useId, useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import FileIcon from '@/components/ui/FileIcon'
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, formatSize } from '@/lib/files'
import { cn } from '@/lib/cn'

/**
 * Lampiran tugas: klik atau seret berkas ke kotak. Satu berkas per tugas.
 * `current` = lampiran yang sudah tersimpan ({ name, size }), `file` = berkas baru yang belum diunggah.
 */
export default function AttachmentField({
  current, file, onChange, onRemove,
  label = 'Lampiran', accept = ATTACHMENT_ACCEPT, maxBytes = ATTACHMENT_MAX_BYTES,
  hint = 'PDF, Word, PowerPoint, Excel, gambar, atau ZIP. Maksimal 10 MB.', pendingNote = 'Diunggah saat disimpan',
}) {
  const inputRef = useRef(null)
  const hintId = useId()
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const pick = (f) => {
    if (!f) return
    const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
    if (!accept.split(',').includes(ext)) return setError('Jenis berkas ini tidak didukung.')
    if (f.size > maxBytes) return setError(`Ukuran berkas maksimal ${Math.round(maxBytes / 1024 / 1024)} MB.`)
    setError('')
    onChange(f)
    return undefined
  }

  const shown = file ? { name: file.name, size: file.size, pending: true } : current

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>

      {shown ? (
        <div className="flex items-center gap-3 rounded-control border border-line bg-canvas px-3 py-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sage text-accent">
            <FileIcon name={shown.name} className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{shown.name}</p>
            <p className="text-xs text-ink-2">
              {[formatSize(shown.size), shown.pending ? pendingNote : null].filter(Boolean).join(' · ') || 'Lampiran tersimpan'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 active:bg-accent/15"
          >
            Ganti
          </button>
          <button
            type="button"
            onClick={() => { setError(''); onRemove() }}
            aria-label={`Hapus lampiran ${shown.name}`}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-danger active:scale-95"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-describedby={hintId}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]) }}
          className={cn(
            'flex w-full items-center gap-3 rounded-control border border-dashed px-3 py-3 text-left transition-colors',
            dragging ? 'border-accent bg-sage/60' : 'border-line-strong bg-surface hover:border-accent/50 hover:bg-sage/30',
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sage text-accent">
            <Paperclip className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">Tambah berkas</span>
            <span className="block text-xs text-ink-2">Klik atau seret berkas ke sini</span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }}
      />

      {error ? (
        <p role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-danger">{error}</p>
      ) : (
        <p id={hintId} className="mt-1.5 text-[0.8125rem] text-ink-2">{hint}</p>
      )}
    </div>
  )
}
