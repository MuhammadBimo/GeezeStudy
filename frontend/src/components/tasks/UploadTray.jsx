import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import FileIcon from '@/components/ui/FileIcon'
import { formatSize } from '@/lib/files'
import { cn } from '@/lib/cn'

function fileBadgeTone(name = '') {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'bg-danger/12 text-danger'
  if (['doc', 'docx'].includes(ext)) return 'bg-blue-500/12 text-blue-600 dark:text-blue-400'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
  if (['ppt', 'pptx'].includes(ext)) return 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
  return 'bg-sage text-accent'
}

function CircularProgress({ progress = 0, indeterminate = false }) {
  const size = 22
  const stroke = 2.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(8, Math.min(100, progress))
  const offset = c - (clamped / 100) * c

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0 -rotate-90', indeterminate && 'animate-spin')}
      aria-label={`Mengupload ${Math.round(progress)}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-line-strong"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={indeterminate ? c * 0.72 : offset}
        className="text-accent transition-[stroke-dashoffset] duration-150 ease-out"
      />
    </svg>
  )
}

function formatEta(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 5) return 'Beberapa detik lagi'
  if (seconds < 60) return `Sekitar ${Math.ceil(seconds)} detik lagi`
  const mins = Math.floor(seconds / 60)
  const rem = Math.ceil(seconds % 60)
  return rem > 0 ? `Sekitar ${mins} menit ${rem} detik lagi` : `Sekitar ${mins} menit lagi`
}

function formatShortEta(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 5) return '< 5 dtk lagi'
  if (seconds < 60) return `~${Math.ceil(seconds)} dtk lagi`
  return `~${Math.ceil(seconds / 60)} mnt lagi`
}

function etaLabel(items, now) {
  const active = items.filter((i) => i.status === 'uploading')
  if (!active.length) return ''

  const saving = active.every((i) => i.progress >= 99)
  if (saving) {
    // Estimasi kasar upload backend→S3 berdasarkan ukuran berkas (~1,5 MB/dtk) dikurangi waktu berjalan.
    const remaining = Math.max(
      ...active.map((i) => {
        const elapsed = i.startedAt ? (now - i.startedAt) / 1000 : 0
        const estTotal = Math.max(2, Math.ceil((i.fileSize || 0) / (1.5 * 1024 * 1024)) + 1)
        return Math.max(0, estTotal - elapsed)
      }),
    )
    return remaining > 1
      ? `Menyimpan ke storage · ${formatEta(remaining)}`
      : 'Menyimpan ke storage · sebentar lagi selesai'
  }

  const withEta = active.map((i) => i.etaSeconds).filter((s) => typeof s === 'number' && Number.isFinite(s) && s > 0)
  if (!withEta.length) return 'Menghitung estimasi waktu...'
  return formatEta(Math.max(...withEta))
}

/**
 * Panel melayang di pojok kanan bawah (ala Google Drive) untuk memantau progres
 * unggahan lampiran tugas beserta informasi tugas terkait.
 */
export default function UploadTray({ items, onCancel, onCancelAll, onDismiss }) {
  const [collapsed, setCollapsed] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const trayRef = useRef(null)

  const hasActive = items.some((i) => i.status === 'uploading')
  const allDone = items.length > 0 && items.every((i) => i.status === 'done')

  useEffect(() => {
    if (!hasActive) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [hasActive])

  // Tutup panel otomatis setelah semua upload selesai agar tidak memenuhi layar.
  useEffect(() => {
    if (!allDone) return undefined
    const timer = setTimeout(() => onDismiss(), 2000)
    return () => clearTimeout(timer)
  }, [allDone, onDismiss])

  // Geser posisi toast ke atas panel upload selama panel tampil.
  useEffect(() => {
    const root = document.documentElement
    const el = trayRef.current
    if (!items.length || !el) {
      root.style.removeProperty('--upload-tray-offset')
      return undefined
    }
    const updateOffset = () => {
      root.style.setProperty('--upload-tray-offset', `${el.offsetHeight + 12}px`)
    }
    updateOffset()
    const observer = new ResizeObserver(updateOffset)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--upload-tray-offset')
    }
  }, [items.length, collapsed])

  const active = items.filter((i) => i.status === 'uploading')
  const doneCount = items.filter((i) => i.status === 'done').length
  const failedCount = items.filter((i) => i.status === 'error').length
  const cancelledCount = items.filter((i) => i.status === 'cancelled').length

  let heading = `${doneCount} upload selesai`
  if (active.length > 0) {
    heading = `Mengupload ${active.length} item`
  } else if (failedCount > 0 && doneCount === 0) {
    heading = `${failedCount} upload gagal`
  } else if (cancelledCount > 0 && doneCount === 0) {
    heading = 'Upload dibatalkan'
  }

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.aside
          ref={trayRef}
          key="upload-tray"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          aria-label="Status upload lampiran"
          className="fixed right-4 bottom-20 z-40 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-lg sm:right-5 lg:bottom-5"
        >
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <p className="truncate text-sm font-semibold text-ink">{heading}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Tampilkan detail upload' : 'Perkecil panel upload'}
              className="grid size-7 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {collapsed ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={active.length > 0 ? onCancelAll : onDismiss}
              aria-label={active.length > 0 ? 'Batalkan semua upload' : 'Tutup panel upload'}
              className="grid size-7 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {active.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-y border-line bg-canvas/80 px-4 py-2 text-xs">
                <span className="truncate text-ink-2">{etaLabel(items, now)}</span>
                <button
                  type="button"
                  onClick={onCancelAll}
                  className="shrink-0 font-medium text-accent transition-colors hover:underline"
                >
                  Batal
                </button>
              </div>
            )}

            <ul className="max-h-64 divide-y divide-line overflow-y-auto">
              {items.map((item) => {
                const elapsedSec = item.startedAt ? Math.max(0, Math.floor((now - item.startedAt) / 1000)) : 0
                const shortEta = formatShortEta(item.etaSeconds)
                return (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', fileBadgeTone(item.fileName))}>
                    <FileIcon name={item.fileName} className="size-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <p className="truncate text-xs text-ink-2" title={item.taskTitle}>
                      Tugas: {item.taskTitle}
                      {item.taskCourse ? ` · ${item.taskCourse}` : ''}
                    </p>
                    <p className={cn('mt-0.5 truncate text-[0.75rem]', item.status === 'error' ? 'text-danger' : 'text-muted')}>
                      {item.status === 'uploading' && (
                        item.progress >= 99
                          ? `${formatSize(item.fileSize)} · Menyimpan (${elapsedSec} dtk)`
                          : [formatSize(item.fileSize), `${Math.round(item.progress)}%`, shortEta].filter(Boolean).join(' · ')
                      )}
                      {item.status === 'done' && `${formatSize(item.fileSize)} · Terunggah`}
                      {item.status === 'cancelled' && 'Upload dibatalkan'}
                      {item.status === 'error' && (item.error || 'Gagal mengunggah berkas')}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {item.status === 'uploading' && (
                      <button
                        type="button"
                        onClick={() => onCancel(item.id)}
                        title="Batalkan upload ini"
                        className="group relative grid size-7 place-items-center rounded-full"
                      >
                        <span className="group-hover:hidden">
                          <CircularProgress progress={item.progress} indeterminate={item.progress >= 99} />
                        </span>
                        <span className="hidden size-6 place-items-center rounded-full bg-ink/10 text-ink group-hover:grid">
                          <X className="size-3.5" aria-hidden="true" />
                        </span>
                      </button>
                    )}
                    {item.status === 'done' && (
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-label="Upload selesai" />
                    )}
                    {(item.status === 'error' || item.status === 'cancelled') && (
                      <AlertCircle className={cn('size-5', item.status === 'error' ? 'text-danger' : 'text-muted')} aria-label={item.status === 'error' ? 'Upload gagal' : 'Upload dibatalkan'} />
                    )}
                  </div>
                </li>
                )
              })}
            </ul>
          </>
        )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
