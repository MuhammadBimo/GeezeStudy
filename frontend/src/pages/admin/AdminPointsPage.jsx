import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { fieldClass } from '@/lib/field'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'

// Input angka ringkas di dalam daftar. Label tersembunyi untuk pembaca layar.
function NumberField({ label, value, onChange, min = 0 }) {
  return (
    <input
      type="number"
      min={min}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} w-28 px-3 py-1.5`}
    />
  )
}

function PointSettings({ initial }) {
  const toast = useToast()
  const [rules, setRules] = useState(initial.rules.map((r) => ({ ...r, points: String(r.points) })))
  const [levels, setLevels] = useState(initial.levels.map((l) => ({ level: l.level, min: String(l.points_required) })))
  const [levelError, setLevelError] = useState('')
  const [saving, setSaving] = useState('')

  const setRule = (key) => (v) => setRules((prev) => prev.map((r) => (r.key === key ? { ...r, points: v } : r)))
  const setLevel = (level) => (v) => setLevels((prev) => prev.map((l) => (l.level === level ? { ...l, min: v } : l)))

  const saveRules = async () => {
    if (rules.some((r) => !(Number(r.points) >= 0))) {
      toast('Points tidak boleh negatif', 'error')
      return
    }
    setSaving('rules')
    try {
      await api.put('/admin/point-settings/rules', { rules: rules.map((r) => ({ key: r.key, points: Number(r.points) })) })
      toast('Aturan Points disimpan')
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setSaving('')
    }
  }

  const saveLevels = async () => {
    const mins = levels.map((l) => Number(l.min))
    if (mins[0] !== 0) return setLevelError('Level 1 harus mulai dari 0 Points.')
    if (mins.some((v, i) => i > 0 && !(v > mins[i - 1]))) return setLevelError('Batas Points tiap level harus lebih besar dari level sebelumnya.')
    setLevelError('')
    setSaving('levels')
    try {
      await api.put('/admin/point-settings/levels', { levels: levels.map((l) => ({ level: l.level, points_required: Number(l.min) })) })
      toast('Ambang Level disimpan')
    } catch (error) {
      setLevelError(errorMessage(error))
    } finally {
      setSaving('')
    }
    return undefined
  }

  const addLevel = () =>
    setLevels((prev) => [...prev, { level: prev.length + 1, min: String(Number(prev.at(-1).min) + 1000) }])
  const dropLevel = () => setLevels((prev) => prev.slice(0, -1))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card tone="primary" className="p-5">
        <h2 className="mb-4 text-xl font-semibold">Aturan Points</h2>
        <ul className="flex flex-col gap-3">
          {rules.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 rounded-panel border border-line p-3">
              <p className="font-semibold">{r.label}</p>
              <NumberField label={`Points untuk ${r.label}`} value={r.points} onChange={setRule(r.key)} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink/80">Points belajar dihitung proporsional dari durasi sesi, dan dibatasi per hari oleh aturan batas harian.</p>
        <Button className="mt-4" onClick={saveRules} loading={saving === 'rules'}>Simpan aturan</Button>
      </Card>

      <Card color="bg-stone" className="p-5">
        <h2 className="mb-4 text-xl font-semibold">Ambang Level</h2>
        <ul className="flex flex-col gap-2">
          {levels.map((l) => (
            <li key={l.level} className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-3">
              <span className="font-display text-lg font-medium">Level {l.level}</span>
              <label className="flex items-center gap-2 text-sm font-medium">
                mulai dari
                <NumberField label={`Points minimum Level ${l.level}`} value={l.min} onChange={setLevel(l.level)} />
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="neutral" onClick={addLevel}><Plus className="size-4" aria-hidden="true" /> Tambah level</Button>
          <Button size="sm" variant="neutral" onClick={dropLevel} disabled={levels.length <= 2}><Trash2 className="size-4" aria-hidden="true" /> Hapus level terakhir</Button>
        </div>
        {levelError && <p role="alert" className="mt-3 rounded-panel border border-line bg-surface p-2 text-sm font-semibold text-danger">{levelError}</p>}
        <Button className="mt-4" variant="secondary" onClick={saveLevels} loading={saving === 'levels'}>Simpan ambang</Button>
      </Card>
    </div>
  )
}

export default function AdminPointsPage() {
  const resource = useResource('/admin/point-settings')
  return (
    <>
      <PageHeader title="Points & Level" subtitle="Points hanya dari aktivitas produktif yang divalidasi. Level tidak turun saat tidak aktif." />
      <AsyncView resource={resource} rows={2}>{(data) => <PointSettings initial={data} />}</AsyncView>
    </>
  )
}
