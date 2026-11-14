import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { dueInfo } from '@/lib/date'
import { cn } from '@/lib/cn'

const priorityDot = { high: 'bg-danger', medium: 'bg-[#c9a96a]', low: 'bg-sage-deep' }
const priorityLabel = { high: 'Prioritas tinggi', medium: 'Prioritas sedang', low: 'Prioritas rendah' }
const toneText = { danger: 'text-danger font-medium', warning: 'text-warning font-medium', neutral: 'text-ink-2' }

// Daftar tugas ringkas di Beranda: centang untuk menyelesaikan (Points dihitung server).
export default function TaskList({ tasks, onComplete }) {
  const [busy, setBusy] = useState(null)

  if (tasks.length === 0) {
    return <EmptyState illustration="tasks" title="Tidak ada tugas tertunda" description="Semua beres. Tambahkan tugas baru dari halaman Tugas." compact={false} />
  }

  const complete = async (t) => {
    setBusy(t.id)
    await onComplete(t)
    setBusy(null)
  }

  return (
    <ul className="divide-y divide-line">
      <AnimatePresence initial={false}>
        {tasks.map((t) => {
          const due = dueInfo(t.due_at)
          return (
            <m.li key={t.id} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3.5 py-3">
              <button
                type="button"
                onClick={() => complete(t)}
                disabled={busy === t.id}
                aria-label={`Tandai selesai: ${t.title}`}
                className={cn(
                  'group grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong transition-all hover:border-forest hover:bg-sage active:scale-90',
                  busy === t.id && 'border-forest bg-forest',
                )}
              >
                <Check className={cn('size-3.5 transition-opacity', busy === t.id ? 'text-surface opacity-100' : 'text-forest opacity-0 group-hover:opacity-100')} strokeWidth={3} aria-hidden="true" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.title}</p>
                <p className="truncate text-[0.8125rem] text-ink-2">{t.course || 'Tanpa mata pelajaran'}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className={cn('text-[0.8125rem]', toneText[due.tone])}>{due.text}</span>
                <span className={cn('size-2 rounded-full', priorityDot[t.priority])} title={priorityLabel[t.priority]} aria-label={priorityLabel[t.priority]} />
              </div>
            </m.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
