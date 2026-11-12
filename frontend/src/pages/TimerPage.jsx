import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import Select from '@/components/ui/Select'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { dayTime } from '@/lib/mappers'

const STORAGE_KEY = 'geezestudy.timer'

const presets = [
  { value: 'quick', label: '15 menit', focus: 15, rest: 0 },
  { value: 'pomodoro', label: 'Pomodoro 25/5', focus: 25, rest: 5 },
  { value: 'deep', label: '50/10', focus: 50, rest: 10 },
  { value: 'custom', label: 'Kustom', focus: 30, rest: 5 },
]

const idleState = {
  presetId: 'pomodoro', customMin: 30, phase: 'focus', status: 'idle',
  endsAt: 0, remainingMs: 0, taskId: '', startedAt: 0,
}

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

export default function TimerPage() {
  const toast = useToast()
  const { setUser } = useAuth()
  const tasks = useResource('/tasks')
  const sessions = useResource('/study-sessions')
  const [s, setS] = useState(readSaved)
  const [now, setNow] = useState(() => Date.now())

  // Salinan terbaru state untuk dibaca di dalam interval tanpa efek samping di updater setState.
  const sRef = useRef(s)
  const finishing = useRef(false)

  const preset = presets.find((p) => p.value === s.presetId)
  const focusMin = focusMinutesOf(s)
  const restMin = preset.rest
  const phaseMin = s.phase === 'focus' ? focusMin : restMin
  const phaseMs = phaseMin * 60_000

  const remaining = s.status === 'running' ? s.endsAt - now : s.status === 'paused' ? s.remainingMs : phaseMs

  // Simpan agar sesi pulih setelah halaman dimuat ulang atau browser ditutup.
  useEffect(() => {
    sRef.current = s
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      /* penyimpanan tidak tersedia: abaikan */
    }
  }, [s])

  // Kirim sesi fokus ke server. Points dihitung dan divalidasi di sana, bukan di sini.
  const record = useCallback(async (minutes, snapshot, endedAt) => {
    if (minutes < 1) return
    try {
      const { data } = await api.post('/study-sessions', {
        task_id: snapshot.taskId ? Number(snapshot.taskId) : null,
        focus_minutes: minutes,
        started_at: new Date(snapshot.startedAt || endedAt - minutes * 60_000).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
      })
      setUser(data.user)
      sessions.reload()
      const earned = data.session.points_awarded
      toast(earned > 0 ? `Sesi ${minutes} menit tercatat. +${earned} Points` : `Sesi ${minutes} menit tercatat`)
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sessions.reload stabil
  }, [setUser, toast, sessions.reload])

  const finish = useCallback(() => {
    if (finishing.current) return
    finishing.current = true
    const cur = sRef.current
    if (cur.phase === 'focus') {
      // Waktu selesai dicatat sebagai akhir timer, bukan "sekarang", agar tab yang tertidur tidak menambah klaim.
      record(focusMinutesOf(cur), cur, cur.endsAt)
    }
    const rest = presets.find((p) => p.value === cur.presetId).rest
    setS({
      ...cur,
      phase: cur.phase === 'focus' && rest > 0 ? 'rest' : 'focus',
      status: 'idle', endsAt: 0, remainingMs: 0, startedAt: 0,
    })
  }, [record])

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
  const elapsedPct = phaseMs ? phaseMs - Math.max(remaining, 0) : 0

  const taskOptions = [
    { value: '', label: 'Tanpa tugas' },
    ...(tasks.data?.data ?? []).filter((t) => t.status !== 'completed').map((t) => ({ value: String(t.id), label: t.title })),
  ]
  const history = sessions.data?.data ?? []

  return (
    <>
      <PageHeader title="Study Timer" subtitle="Pilih durasi, mulai fokus, dan catat sesi belajarmu." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          tone="primary"
          color={s.phase === 'focus' ? 'bg-forest' : 'bg-forest-mid'}
          className="flex flex-col items-center gap-6 p-6 text-surface sm:p-10 lg:col-span-2"
        >
          <Badge color="bg-surface text-forest" className="text-sm">
            {s.phase === 'focus' ? 'Waktu fokus' : 'Waktu istirahat'}
          </Badge>

          <p
            role="timer"
            aria-live="off"
            aria-label={`Sisa waktu ${mmss(remaining)}`}
            className="font-display text-[clamp(4.5rem,20vw,9.5rem)] font-semibold leading-none tabular-nums"
          >
            {mmss(remaining)}
          </p>

          <div className="w-full max-w-md">
            <ProgressBar value={elapsedPct} max={phaseMs || 1} color="bg-clay" label="Progres sesi" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {idle && (
              <Button variant="secondary" size="md" className="px-8 text-lg" onClick={start} disabled={phaseMin < 1}>
                <Play className="size-5" aria-hidden="true" /> {s.phase === 'focus' ? 'Mulai fokus' : 'Mulai istirahat'}
              </Button>
            )}
            {s.status === 'running' && (
              <Button variant="neutral" className="px-8 text-lg" onClick={pause}>
                <Pause className="size-5" aria-hidden="true" /> Jeda
              </Button>
            )}
            {s.status === 'paused' && (
              <Button variant="secondary" className="px-8 text-lg" onClick={resume}>
                <Play className="size-5" aria-hidden="true" /> Lanjutkan
              </Button>
            )}
            {!idle && (
              <Button variant="neutral" className="px-6 text-lg" onClick={stop}>
                <Square className="size-5" aria-hidden="true" /> Berhenti
              </Button>
            )}
            {idle && s.phase === 'rest' && (
              <Button variant="neutral" onClick={() => setS((c) => ({ ...c, phase: 'focus' }))}>
                <RotateCcw className="size-4" aria-hidden="true" /> Lewati istirahat
              </Button>
            )}
          </div>

          <p className="max-w-md text-center text-sm text-surface/80">
            Points diberikan setelah sesi fokus dicatat dan divalidasi server. Berhenti sebelum 1 menit tidak dicatat.
          </p>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-xl font-semibold">Pengaturan sesi</h2>
            <div>
              <p id="durasi-label" className="mb-2 text-sm font-semibold">Durasi</p>
              {idle ? (
                <SegmentedControl
                  label="Durasi"
                  options={presets}
                  value={s.presetId}
                  onChange={(v) => setS((c) => ({ ...c, presetId: v, phase: 'focus' }))}
                />
              ) : (
                <p className="text-sm text-ink/80">Berhenti dulu untuk mengganti durasi.</p>
              )}
            </div>
            {idle && s.presetId === 'custom' && (
              <Input
                label="Menit fokus"
                type="number"
                min={1}
                max={180}
                value={s.customMin}
                onChange={(e) => setS((c) => ({ ...c, customMin: Math.min(180, Math.max(1, Number(e.target.value) || 1)) }))}
              />
            )}
            <Select
              label="Tugas yang dikerjakan"
              options={taskOptions}
              value={s.taskId}
              disabled={!idle}
              onChange={(e) => setS((c) => ({ ...c, taskId: e.target.value }))}
            />
          </Card>

          <Card color="bg-sand-deep" className="p-5">
            <h2 className="mb-3 text-xl font-semibold">Riwayat belajar</h2>
            {history.length === 0 ? (
              <p className="text-sm font-medium">Belum ada sesi. Mulai sesi fokus pertamamu.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {history.slice(0, 5).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{h.task?.title ?? 'Tanpa tugas'}</p>
                      <p className="text-xs text-ink/80">{dayTime(h.started_at)}</p>
                    </div>
                    <Badge color="bg-moss">{h.focus_minutes} mnt</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
