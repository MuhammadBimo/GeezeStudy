import { useCallback, useEffect, useRef, useState } from 'react'
import { m } from 'motion/react'
import { Coffee, Pause, Play, RotateCcw, Square } from 'lucide-react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { TODAY, toISO } from '@/lib/date'
import { clockTime } from '@/lib/mappers'

const STORAGE_KEY = 'geezestudy.timer'

const presets = [
  { value: 'quick', label: '15 menit', focus: 15, rest: 0 },
  { value: 'pomodoro', label: 'Pomodoro', focus: 25, rest: 5 },
  { value: 'deep', label: '50 / 10', focus: 50, rest: 10 },
  { value: 'custom', label: 'Kustom', focus: 30, rest: 5 },
]

const idleState = { presetId: 'pomodoro', customMin: 30, phase: 'focus', status: 'idle', endsAt: 0, remainingMs: 0, taskId: '', startedAt: 0 }

const readSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...idleState, ...JSON.parse(raw) } : idleState
  } catch {
    return idleState
  }
}

const mmss = (ms) => {
  const total = Math.ceil(Math.max(ms, 0) / 1000)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
const focusMinutesOf = (s) => (s.presetId === 'custom' ? s.customMin : presets.find((p) => p.value === s.presetId).focus)

function TimerRing({ fraction, phase, children }) {
  const size = 300
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[18.75rem]">
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-ink/[0.06]" />
        <m.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          className={phase === 'focus' ? 'stroke-forest' : 'stroke-[#c9a96a]'}
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - fraction) }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export default function TimerPage() {
  const toast = useToast()
  const { user, setUser } = useAuth()
  const tasks = useResource('/tasks')
  const sessions = useResource('/study-sessions')
  const [s, setS] = useState(readSaved)
  const [now, setNow] = useState(() => Date.now())
  const sRef = useRef(s)
  const finishing = useRef(false)

  const preset = presets.find((p) => p.value === s.presetId)
  const focusMin = focusMinutesOf(s)
  const phaseMin = s.phase === 'focus' ? focusMin : preset.rest
  const phaseMs = phaseMin * 60_000
  const remaining = s.status === 'running' ? s.endsAt - now : s.status === 'paused' ? s.remainingMs : phaseMs

  useEffect(() => {
    sRef.current = s
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* abaikan */ }
  }, [s])

  // Kirim sesi fokus ke server. Points dihitung dan divalidasi di sana, bukan di sini.
  const record = useCallback(async (minutes, snapshot, endedAt) => {
    if (minutes < 1) {
      toast.info('Sesi di bawah 1 menit tidak dicatat')
      return
    }
    try {
      const { data } = await toast.promise(
        api.post('/study-sessions', {
          task_id: snapshot.taskId ? Number(snapshot.taskId) : null,
          focus_minutes: minutes,
          started_at: new Date(snapshot.startedAt || endedAt - minutes * 60_000).toISOString(),
          ended_at: new Date(endedAt).toISOString(),
        }),
        {
          loading: 'Mencatat sesi...',
          success: (res) => (res.data.session.points_awarded > 0 ? `Sesi ${minutes} menit tercatat. +${res.data.session.points_awarded} Points` : `Sesi ${minutes} menit tercatat`),
          error: (err) => errorMessage(err),
        },
      )
      setUser(data.user)
      sessions.reload()
    } catch {
      /* pesan galat sudah tampil lewat toast */
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sessions.reload stabil
  }, [setUser, toast, sessions.reload])

  const finish = useCallback(() => {
    if (finishing.current) return
    finishing.current = true
    const cur = sRef.current
    if (cur.phase === 'focus') record(focusMinutesOf(cur), cur, cur.endsAt)
    else toast.info('Istirahat selesai', { description: 'Siap untuk sesi fokus berikutnya.' })
    const rest = presets.find((p) => p.value === cur.presetId).rest
    setS({ ...cur, phase: cur.phase === 'focus' && rest > 0 ? 'rest' : 'focus', status: 'idle', endsAt: 0, remainingMs: 0, startedAt: 0 })
  }, [record, toast])

  useEffect(() => {
    if (s.status !== 'running') return undefined
    finishing.current = false
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (sRef.current.endsAt - t <= 0) finish()
    }, 250)
    return () => clearInterval(id)
  }, [s.status, s.endsAt, finish])

  const start = () => {
    const t = Date.now()
    setNow(t)
    setS((cur) => ({ ...cur, status: 'running', endsAt: t + phaseMs, remainingMs: 0, startedAt: t }))
  }
  const pause = () => setS((cur) => ({ ...cur, status: 'paused', remainingMs: Math.max(cur.endsAt - Date.now(), 0) }))
  const resume = () => {
    const t = Date.now()
    setNow(t)
    setS((cur) => ({ ...cur, status: 'running', endsAt: t + cur.remainingMs }))
  }
  const stop = () => {
    if (s.phase === 'focus') record(Math.floor((phaseMs - Math.max(remaining, 0)) / 60_000), s, Date.now())
    setS((cur) => ({ ...cur, phase: 'focus', status: 'idle', endsAt: 0, remainingMs: 0, startedAt: 0 }))
  }

  const idle = s.status === 'idle'
  const fraction = phaseMs ? (phaseMs - Math.max(remaining, 0)) / phaseMs : 0
  const taskOptions = [
    { value: '', label: 'Tanpa tugas' },
    ...(tasks.data?.data ?? []).filter((t) => t.status !== 'completed').map((t) => ({ value: String(t.id), label: t.title, description: t.course ?? undefined })),
  ]
  const history = sessions.data?.data ?? []
  const today = history.filter((h) => toISO(new Date(h.started_at)) === TODAY)
  const todayMinutes = today.reduce((a, h) => a + h.focus_minutes, 0)
  const currentTask = taskOptions.find((o) => o.value === s.taskId)

  return (
    <>
      <PageHeader title="Study Timer" subtitle="Pilih durasi, mulai fokus. Sesi tercatat otomatis dan memberi Points." />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Timer" className="rounded-panel border border-line bg-surface px-5 py-8 shadow-xs sm:px-10">
          <div className="flex justify-center">
            {idle ? (
              <SegmentedControl label="Durasi" options={presets} value={s.presetId} onChange={(v) => setS((c) => ({ ...c, presetId: v, phase: 'focus' }))} />
            ) : (
              <p className="h-11 text-sm text-ink-2">Hentikan sesi untuk mengganti durasi.</p>
            )}
          </div>

          <div className="mt-8">
            <TimerRing fraction={fraction} phase={s.phase}>
              <div className="text-center">
                <p className={cn('inline-flex items-center gap-1.5 text-sm font-medium', s.phase === 'focus' ? 'text-forest' : 'text-[#8a6a2c]')}>
                  {s.phase === 'focus' ? 'Waktu fokus' : <><Coffee className="size-4" aria-hidden="true" /> Istirahat</>}
                </p>
                <p role="timer" aria-live="off" aria-label={`Sisa waktu ${mmss(remaining)}`} className="mt-1 font-display text-[4.25rem] leading-none tabular-nums sm:text-[4.75rem]">
                  {mmss(remaining)}
                </p>
                <p className="mt-2 max-w-48 truncate text-sm text-ink-2">{s.phase === 'focus' && currentTask?.value ? currentTask.label : s.status === 'paused' ? 'Dijeda' : `${phaseMin} menit`}</p>
              </div>
            </TimerRing>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {idle && (
              <Button size="lg" className="min-w-44" onClick={start} disabled={phaseMin < 1}>
                <Play aria-hidden="true" /> {s.phase === 'focus' ? 'Mulai fokus' : 'Mulai istirahat'}
              </Button>
            )}
            {s.status === 'running' && <Button size="lg" variant="secondary" className="min-w-36" onClick={pause}><Pause aria-hidden="true" /> Jeda</Button>}
            {s.status === 'paused' && <Button size="lg" className="min-w-36" onClick={resume}><Play aria-hidden="true" /> Lanjutkan</Button>}
            {!idle && <Button size="lg" variant="ghost" onClick={stop}><Square aria-hidden="true" /> Selesai</Button>}
            {idle && s.phase === 'rest' && <Button size="lg" variant="ghost" onClick={() => setS((c) => ({ ...c, phase: 'focus' }))}><RotateCcw aria-hidden="true" /> Lewati istirahat</Button>}
          </div>

          <div className="mx-auto mt-8 grid max-w-md gap-4 sm:grid-cols-[1fr_auto]">
            <Select label="Tugas yang dikerjakan" searchable options={taskOptions} value={s.taskId} disabled={!idle} onChange={(e) => setS((c) => ({ ...c, taskId: e.target.value }))} />
            {idle && s.presetId === 'custom' && (
              <Input
                label="Menit fokus" type="number" min={1} max={180} className="sm:w-28"
                value={s.customMin}
                onChange={(e) => setS((c) => ({ ...c, customMin: Math.min(180, Math.max(1, Number(e.target.value) || 1)) }))}
              />
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="today-title" className="rounded-panel bg-forest p-5 text-surface">
            <h2 id="today-title" className="text-sm font-medium text-surface/75">Belajar hari ini</h2>
            <p className="mt-1 font-display text-[2.25rem] leading-tight tabular-nums">{todayMinutes}<span className="font-sans text-base text-surface/70"> / {user.daily_goal_minutes} menit</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-sand transition-[width] duration-500" style={{ width: `${Math.min(100, (todayMinutes / Math.max(user.daily_goal_minutes, 1)) * 100)}%` }} />
            </div>
          </section>

          <section aria-labelledby="hist-title">
            <h2 id="hist-title" className="mb-2 text-sm font-semibold">Sesi terakhir</h2>
            {history.length === 0 ? (
              <EmptyState compact illustration="target" title="Belum ada sesi" description="Mulai sesi fokus pertamamu." />
            ) : (
              <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
                {history.slice(0, 6).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.task?.title ?? 'Tanpa tugas'}</p>
                      <p className="text-xs text-ink-2">{toISO(new Date(h.started_at)) === TODAY ? 'Hari ini' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(h.started_at))}, {clockTime(h.started_at)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{h.focus_minutes} mnt</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}
