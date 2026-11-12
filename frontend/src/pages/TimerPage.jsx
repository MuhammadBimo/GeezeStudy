import { useCallback, useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import Select from '@/components/ui/Select'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'geezestudy.timer'

const presets = [
  { value: 'quick', label: '15 menit', focus: 15, rest: 0 },
  { value: 'pomodoro', label: 'Pomodoro 25/5', focus: 25, rest: 5 },
  { value: 'deep', label: '50/10', focus: 50, rest: 10 },
  { value: 'custom', label: 'Kustom', focus: 30, rest: 5 },
]

// DATA SEMENTARA (mock): daftar tugas dan riwayat akan berasal dari API.
const taskOptions = [
  { value: '', label: 'Tanpa tugas' },
  { value: 'Laporan Praktikum Basis Data', label: 'Laporan Praktikum Basis Data' },
  { value: 'Rangkuman Bab 5', label: 'Rangkuman Bab 5' },
  { value: 'Latihan Soal Kalkulus', label: 'Latihan Soal Kalkulus' },
]

const initialHistory = [
  { id: 1, task: 'Rangkuman Bab 5', minutes: 25, when: 'Kemarin, 19:30' },
  { id: 2, task: 'Latihan Soal Kalkulus', minutes: 50, when: 'Kemarin, 15:10' },
]

const idleState = { presetId: 'pomodoro', customMin: 30, phase: 'focus', status: 'idle', endsAt: 0, remainingMs: 0, task: '' }

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

export default function TimerPage() {
  const toast = useToast()
  const [s, setS] = useState(readSaved)
  const [now, setNow] = useState(() => Date.now())
  const [history, setHistory] = useState(initialHistory)

  const preset = presets.find((p) => p.value === s.presetId)
  const focusMin = s.presetId === 'custom' ? s.customMin : preset.focus
  const restMin = preset.rest
  const phaseMin = s.phase === 'focus' ? focusMin : restMin
  const phaseMs = phaseMin * 60_000

  const remaining = s.status === 'running' ? s.endsAt - now : s.status === 'paused' ? s.remainingMs : phaseMs

  // Simpan agar sesi pulih setelah halaman dimuat ulang atau browser ditutup.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      /* penyimpanan tidak tersedia: abaikan */
    }
  }, [s])

  const record = useCallback((minutes, task) => {
    if (minutes < 1) return
    const when = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    setHistory((h) => [{ id: Date.now(), task: task || 'Tanpa tugas', minutes, when: `Hari ini, ${when}` }, ...h])
    toast(`Sesi ${minutes} menit tercatat`)
  }, [toast])

  const finish = useCallback(() => {
    setS((cur) => {
      if (cur.phase === 'focus') {
        record(cur.presetId === 'custom' ? cur.customMin : presets.find((p) => p.value === cur.presetId).focus, cur.task)
        const rest = presets.find((p) => p.value === cur.presetId).rest
        return { ...cur, phase: rest > 0 ? 'rest' : 'focus', status: 'idle', endsAt: 0, remainingMs: 0 }
      }
      return { ...cur, phase: 'focus', status: 'idle', endsAt: 0, remainingMs: 0 }
    })
  }, [record])

  useEffect(() => {
    if (s.status !== 'running') return undefined
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (s.endsAt - t <= 0) finish()
    }, 250)
    return () => clearInterval(id)
  }, [s.status, s.endsAt, finish])

  const start = () => {
    const t = Date.now()
    setNow(t)
    setS((cur) => ({ ...cur, status: 'running', endsAt: t + phaseMs, remainingMs: 0 }))
  }
  const pause = () => setS((cur) => ({ ...cur, status: 'paused', remainingMs: Math.max(cur.endsAt - Date.now(), 0) }))
  const resume = () => {
    const t = Date.now()
    setNow(t)
    setS((cur) => ({ ...cur, status: 'running', endsAt: t + cur.remainingMs }))
  }
  const stop = () => {
    if (s.phase === 'focus') record(Math.floor((phaseMs - Math.max(remaining, 0)) / 60_000), s.task)
    setS((cur) => ({ ...cur, phase: 'focus', status: 'idle', endsAt: 0, remainingMs: 0 }))
  }

  const idle = s.status === 'idle'
  const elapsedPct = phaseMs ? phaseMs - Math.max(remaining, 0) : 0

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
            Points hanya diberikan setelah sesi divalidasi oleh server. Tampilan ini belum tersambung ke backend.
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
              value={s.task}
              disabled={!idle}
              onChange={(e) => setS((c) => ({ ...c, task: e.target.value }))}
            />
          </Card>

          <Card color="bg-sand-deep" className="p-5">
            <h2 className="mb-3 text-xl font-semibold">Riwayat belajar</h2>
            <ul className="flex flex-col gap-2">
              {history.slice(0, 5).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface px-3 py-2">
                  <div className={cn('min-w-0')}>
                    <p className="truncate text-sm font-semibold">{h.task}</p>
                    <p className="text-xs text-ink/80">{h.when}</p>
                  </div>
                  <Badge color="bg-moss">{h.minutes} mnt</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
