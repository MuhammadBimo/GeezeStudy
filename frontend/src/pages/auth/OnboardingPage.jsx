import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { educationLevels, institutionField } from '@/lib/profile'

const goalPresets = [
  { minutes: 30, note: 'Ringan' },
  { minutes: 60, note: 'Seimbang' },
  { minutes: 90, note: 'Serius' },
  { minutes: 120, note: 'Intensif' },
]

// Hanya menanyakan yang belum diisi saat registrasi, supaya jenjang tidak ditanyakan dua kali.
export default function OnboardingPage() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [steps] = useState(() => [...(user.education_level ? [] : ['level']), ...(user.institution ? [] : ['institution']), 'goal'])
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState(user.education_level ?? 'sma')
  const [institution, setInstitution] = useState(user.institution ?? '')
  const [goal, setGoal] = useState(user.daily_goal_minutes ?? 60)
  const [saving, setSaving] = useState(false)

  const current = steps[step]
  const last = step === steps.length - 1
  const inst = institutionField[level]

  const finish = async () => {
    setSaving(true)
    try {
      const { data } = await api.post('/onboarding', { education_level: level, institution: institution.trim() || null, daily_goal_minutes: goal })
      setUser(data)
      toast('Siap. Selamat belajar!')
    } catch (error) {
      toast(errorMessage(error), 'error')
      setSaving(false)
    }
  }

  return (
    <AuthLayout title={`Halo, ${user.name.split(' ')[0]}`} subtitle="Atur GeezeStudy sesuai kebutuhanmu. Semua bisa diubah lagi di Pengaturan.">
      {steps.length > 1 && (
        <ol aria-label="Langkah" className="mb-6 flex gap-1.5">
          {steps.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i <= step ? 'bg-forest' : 'bg-ink/10')}>
              <span className="sr-only">Langkah {i + 1} dari {steps.length}{i < step ? ', selesai' : ''}</span>
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <m.section key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          {current === 'level' && (
            <>
              <h2 className="text-lg font-semibold">Kamu sedang di jenjang apa?</h2>
              <div role="radiogroup" aria-label="Jenjang pendidikan" className="mt-4 grid grid-cols-2 gap-2.5">
                {educationLevels.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    role="radio"
                    aria-checked={level === l.value}
                    onClick={() => setLevel(l.value)}
                    className={cn('flex h-14 items-center justify-between rounded-xl border px-4 text-left font-medium transition-all active:scale-[0.98]', level === l.value ? 'border-forest bg-sage text-forest' : 'border-line bg-surface hover:border-line-strong')}
                  >
                    {l.label}
                    {level === l.value && <Check className="size-4" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </>
          )}

          {current === 'institution' && (
            <>
              <h2 className="text-lg font-semibold">{level === 'college' ? 'Kamu kuliah di mana?' : 'Kamu sekolah di mana?'}</h2>
              <p className="mb-4 mt-1 text-sm text-ink-2">Boleh dikosongkan.</p>
              <Input label={inst.label} placeholder={inst.placeholder} autoComplete="organization" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </>
          )}

          {current === 'goal' && (
            <>
              <h2 className="text-lg font-semibold">Berapa menit belajar setiap hari?</h2>
              <p className="mb-4 mt-1 text-sm text-ink-2">Target ini dipakai di Beranda dan misi harian.</p>
              <div role="radiogroup" aria-label="Target menit per hari" className="grid grid-cols-2 gap-2.5">
                {goalPresets.map((g) => (
                  <button
                    key={g.minutes}
                    type="button"
                    role="radio"
                    aria-checked={goal === g.minutes}
                    onClick={() => setGoal(g.minutes)}
                    className={cn('rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98]', goal === g.minutes ? 'border-forest bg-sage' : 'border-line bg-surface hover:border-line-strong')}
                  >
                    <span className="block font-display text-2xl tabular-nums">{g.minutes}<span className="ml-1 font-sans text-sm text-ink-2">menit</span></span>
                    <span className="text-xs text-ink-2">{g.note}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </m.section>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft aria-hidden="true" /> Kembali
        </Button>
        {last ? (
          <Button size="lg" onClick={finish} loading={saving}>Mulai belajar <ArrowRight aria-hidden="true" /></Button>
        ) : (
          <Button size="lg" onClick={() => setStep((s) => s + 1)}>Lanjut <ArrowRight aria-hidden="true" /></Button>
        )}
      </div>
    </AuthLayout>
  )
}
