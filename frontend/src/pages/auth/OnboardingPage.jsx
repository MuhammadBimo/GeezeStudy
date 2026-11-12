import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { api, errorMessage } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { educationLevels } from '@/lib/profile'

const levelColors = { sd: 'bg-sand-deep', smp: 'bg-moss', sma: 'bg-mist', college: 'bg-sage' }
const goalPresets = [30, 60, 90, 120]
const STEPS = ['Jenjang', 'Institusi', 'Target']

export default function OnboardingPage() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState(user.education_level ?? 'college')
  const [saving, setSaving] = useState(false)
  const [institution, setInstitution] = useState(user.institution ?? '')
  const [goal, setGoal] = useState(user.daily_goal_minutes)

  const last = step === STEPS.length - 1

  const finish = async () => {
    setSaving(true)
    try {
      const { data } = await api.post('/onboarding', {
        education_level: level,
        institution: institution.trim() || null,
        daily_goal_minutes: goal,
      })
      setUser(data)
      toast('Siap! Selamat belajar.')
    } catch (error) {
      toast(errorMessage(error), 'error')
      setSaving(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-forest-tint p-5">
      <Card tone="primary" className="w-full max-w-lg p-6 sm:p-8">
        <ol aria-label="Langkah" className="mb-6 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? 'step' : undefined}>
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border border-line text-sm font-semibold transition-colors motion-reduce:transition-none',
                  i < step ? 'bg-moss' : i === step ? 'bg-sage' : 'bg-surface',
                )}
              >
                {i < step ? <Check className="size-4" strokeWidth={3} aria-label="Selesai" /> : i + 1}
              </span>
              <span className={cn('hidden text-sm font-semibold sm:inline', i !== step && 'text-ink/80')}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-0.5 flex-1 bg-ink/30" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            {step === 0 && (
              <section>
                <h1 className="text-3xl font-semibold">Kamu sedang di jenjang apa?</h1>
                <p className="mb-4 mt-1 text-ink/80">Supaya tampilan dan misi terasa pas untukmu.</p>
                <div role="radiogroup" aria-label="Jenjang pendidikan" className="grid grid-cols-2 gap-3">
                  {educationLevels.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      role="radio"
                      aria-checked={level === l.value}
                      onClick={() => setLevel(l.value)}
                      className={cn(
                        'rounded-panel border border-line p-4 text-left font-display text-xl font-medium transition-all active:scale-95 motion-reduce:transition-none',
                        level === l.value ? `${levelColors[l.value]} shadow-soft` : 'bg-surface hover:-translate-y-0.5',
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 1 && (
              <section>
                <h1 className="text-3xl font-semibold">Dari mana asalmu?</h1>
                <p className="mb-4 mt-1 text-ink/80">Nama sekolah atau kampus. Boleh dikosongkan.</p>
                <Input label="Sekolah / kampus (opsional)" autoComplete="organization" value={institution} onChange={(e) => setInstitution(e.target.value)} />
              </section>
            )}

            {step === 2 && (
              <section>
                <h1 className="text-3xl font-semibold">Target belajar harian</h1>
                <p className="mb-4 mt-1 text-ink/80">Berapa menit yang ingin kamu capai tiap hari? Bisa diubah kapan saja di Pengaturan.</p>
                <div role="radiogroup" aria-label="Target menit per hari" className="grid grid-cols-4 gap-2">
                  {goalPresets.map((g) => (
                    <button
                      key={g}
                      type="button"
                      role="radio"
                      aria-checked={goal === g}
                      onClick={() => setGoal(g)}
                      className={cn(
                        'rounded-panel border border-line py-3 font-display text-xl font-medium transition-all active:scale-95 motion-reduce:transition-none',
                        goal === g ? 'bg-sand-deep shadow-soft-sm' : 'bg-surface',
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-sm text-ink/80">menit per hari</p>
              </section>
            )}
          </m.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="neutral" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali
          </Button>
          {last ? (
            <Button onClick={finish} loading={saving}>Mulai belajar <ArrowRight className="size-4" aria-hidden="true" /></Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)}>Lanjut <ArrowRight className="size-4" aria-hidden="true" /></Button>
          )}
        </div>
      </Card>
    </main>
  )
}
