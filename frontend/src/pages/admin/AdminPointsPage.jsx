import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { fieldClass } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { initialLevels, initialPointRules } from '@/lib/mockAdmin'

// Input angka ringkas di dalam tabel/daftar. Label tersembunyi untuk pembaca layar.
function NumberField({ label, value, onChange, min = 0 }) {
  return (
    <input
      type="number"
      min={min}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} w-24 px-3 py-1.5`}
    />
  )
}

export default function AdminPointsPage() {
  const toast = useToast()
  const [rules, setRules] = useState(initialPointRules.map((r) => ({ ...r, points: String(r.points), cap: String(r.cap) })))
  const [levels, setLevels] = useState(initialLevels.map((l) => ({ ...l, min: String(l.min) })))
  const [levelError, setLevelError] = useState('')

  const setRule = (id, field) => (v) => setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: v } : r)))
  const setLevel = (level) => (v) => setLevels((prev) => prev.map((l) => (l.level === level ? { ...l, min: v } : l)))

  const saveRules = () => {
    if (rules.some((r) => !(Number(r.points) >= 0) || !(Number(r.cap) >= 0))) {
      toast('Points dan batas harian tidak boleh negatif')
      return
    }
    toast('Aturan Points disimpan')
  }

  const saveLevels = () => {
    const mins = levels.map((l) => Number(l.min))
    if (mins[0] !== 0) return setLevelError('Level 1 harus mulai dari 0 Points.')
    if (mins.some((v, i) => i > 0 && !(v > mins[i - 1]))) return setLevelError('Batas Points tiap level harus lebih besar dari level sebelumnya.')
    setLevelError('')
    return toast('Ambang Level disimpan')
  }

  return (
    <>
      <PageHeader
        title="Points & Level"
        subtitle="Points hanya dari aktivitas produktif yang divalidasi. Level tidak turun saat tidak aktif."
        action={<Badge color="bg-sand-deep">Data contoh (sementara)</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="primary" className="p-5">
          <h2 className="mb-4 text-xl font-semibold">Aturan Points</h2>
          <ul className="flex flex-col gap-3">
            {rules.map((r) => (
              <li key={r.id} className="rounded-panel border border-line p-3">
                <p className="font-semibold">{r.activity}</p>
                <p className="mb-2 text-xs text-ink/80">{r.unit}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-2 font-medium">
                    Points <NumberField label={`Points untuk ${r.activity}`} value={r.points} onChange={setRule(r.id, 'points')} />
                  </label>
                  <label className="flex items-center gap-2 font-medium">
                    Maks/hari <NumberField label={`Batas harian untuk ${r.activity}`} value={r.cap} onChange={setRule(r.id, 'cap')} />
                  </label>
                </div>
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={saveRules}>Simpan aturan</Button>
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
          {levelError && <p role="alert" className="mt-3 rounded-panel border border-line bg-surface p-2 text-sm font-semibold text-danger">{levelError}</p>}
          <Button className="mt-4" variant="secondary" onClick={saveLevels}>Simpan ambang</Button>
        </Card>
      </div>
    </>
  )
}
