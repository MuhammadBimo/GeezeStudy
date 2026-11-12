import { useState } from 'react'
import { CalendarSync, LogOut, ShieldCheck, Target, UserRound } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { errorMessage, fieldErrors } from '@/lib/api'
import { educationLevels } from '@/lib/profile'

const privacyOptions = [
  { value: 'show', label: 'Teman bisa melihat' },
  { value: 'hide', label: 'Hanya saya' },
]

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    education_level: user.education_level ?? 'college',
    institution: user.institution ?? '',
  })
  const [goal, setGoal] = useState(String(user.daily_goal_minutes))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState('')

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const save = async (key, patch, success) => {
    setSaving(key)
    try {
      await updateProfile(patch)
      setErrors({})
      toast(success)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      if (!Object.keys(fields).length) toast(errorMessage(error), 'error')
    } finally {
      setSaving('')
    }
  }

  const saveProfile = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setErrors({ name: 'Nama tidak boleh kosong.' })
      return
    }
    save('profile', {
      name: form.name.trim(),
      email: form.email.trim(),
      education_level: form.education_level,
      institution: form.institution.trim() || null,
    }, form.email.trim() !== user.email ? 'Profil disimpan. Cek emailmu untuk verifikasi alamat baru.' : 'Profil disimpan')
  }

  const saveGoal = (e) => {
    e.preventDefault()
    const minutes = Number(goal)
    if (!(minutes >= 10 && minutes <= 600)) {
      setErrors({ daily_goal_minutes: 'Isi antara 10 sampai 600 menit.' })
      return
    }
    save('goal', { daily_goal_minutes: minutes }, 'Target harian disimpan')
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast('Kamu sudah keluar')
    } catch {
      toast('Gagal keluar. Coba lagi.', 'error')
    }
  }

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Atur profil, privasi, dan integrasimu." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="primary" className="p-5 lg:row-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <UserRound className="size-5" aria-hidden="true" /> Profil
          </h2>
          <form onSubmit={saveProfile} noValidate className="flex flex-col gap-4">
            <Input label="Nama" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} hint="Mengganti email meminta verifikasi ulang." />
            <Select label="Jenjang pendidikan" options={educationLevels} value={form.education_level} onChange={set('education_level')} />
            <Input label="Sekolah / kampus (opsional)" autoComplete="organization" value={form.institution} onChange={set('institution')} error={errors.institution} />
            <Button type="submit" className="self-start" loading={saving === 'profile'}>Simpan profil</Button>
          </form>
        </Card>

        <Card color="bg-sand-deep" className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Target className="size-5" aria-hidden="true" /> Target belajar harian
          </h2>
          <form onSubmit={saveGoal} noValidate className="flex items-end gap-3">
            <Input className="flex-1" label="Menit per hari" type="number" min={10} max={600} value={goal} onChange={(e) => setGoal(e.target.value)} error={errors.daily_goal_minutes} />
            <Button type="submit" loading={saving === 'goal'}>Simpan</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <ShieldCheck className="size-5" aria-hidden="true" /> Privasi statistik
          </h2>
          <p className="mb-3 text-sm text-ink/80">Atur siapa yang boleh melihat Level, Streak, dan waktu belajarmu.</p>
          <SegmentedControl
            label="Privasi statistik"
            options={privacyOptions}
            value={user.privacy_show_progress ? 'show' : 'hide'}
            onChange={(v) => save('privacy', { privacy_show_progress: v === 'show' }, 'Privasi diperbarui')}
          />
        </Card>

        <Card color="bg-mist" className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <CalendarSync className="size-5" aria-hidden="true" /> Google Calendar
          </h2>
          <p className="mb-4 text-sm">Rencananya sinkronisasi satu arah: kegiatan dari GeezeStudy dikirim ke Google Calendar-mu. Fitur ini belum tersambung ke Google; pilihanmu disimpan untuk saat fitur ini aktif.</p>
          <div className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-3">
            <div>
              <p className="font-semibold">Sinkronkan kegiatan</p>
              <p className="text-sm text-ink/80">{user.calendar_sync ? 'Dipilih (belum aktif)' : 'Tidak dipilih'}</p>
            </div>
            <Toggle
              label="Sinkronkan kegiatan ke Google Calendar"
              checked={user.calendar_sync}
              onChange={(v) => save('sync', { calendar_sync: v }, v ? 'Pilihan sinkronisasi disimpan' : 'Sinkronisasi dimatikan')}
            />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 text-xl font-semibold">Akun</h2>
          <p className="mb-3 text-sm text-ink/80">Keluar mengakhiri sesi di perangkat ini.</p>
          <Button variant="neutral" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </Button>
        </Card>
      </div>
    </>
  )
}
