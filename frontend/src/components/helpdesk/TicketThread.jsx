import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { dayTime } from '@/lib/mappers'

/**
 * Riwayat percakapan laporan, mengikuti sudut pandang pembaca: pesanmu sendiri di kanan,
 * pesan lawan bicara di kiri, catatan sistem di tengah. `viewer` = 'student' atau 'admin'.
 */
export default function TicketThread({ messages, viewer = 'student' }) {
  const endRef = useRef(null)
  const mine = (m) => (viewer === 'admin' ? m.is_staff : !m.is_staff)
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [messages.length])

  return (
    <ol aria-label="Riwayat percakapan" className="flex flex-col gap-3">
      {messages.map((m) => (
        m.kind === 'event' ? (
          <li key={m.id} className="text-center text-xs text-ink-2">{m.body} <span className="text-muted">· {dayTime(m.created_at)}</span></li>
        ) : (
          <li key={m.id} className={cn('flex flex-col gap-1', mine(m) ? 'items-end' : 'items-start')}>
            <p className="px-1 text-xs text-ink-2">{m.author} <span className="text-muted">· {dayTime(m.created_at)}</span></p>
            <p className={cn(
              'max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
              mine(m) ? 'rounded-tr-md bg-sage text-ink' : 'rounded-tl-md bg-canvas text-ink',
            )}>{m.body}</p>
          </li>
        )
      ))}
      <li ref={endRef} aria-hidden="true" className="h-0" />
    </ol>
  )
}
