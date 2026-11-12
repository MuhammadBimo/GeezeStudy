import { useState } from 'react'
import { CalendarSync, LogOut, ShieldCheck, Target, UserRound } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { educationLevels } from '@/lib/profile'

const privacyOptions = [
  { value: 'friends', label: 'Teman bisa melihat' },
  { value: 'private', label: 'Hanya saya' },
]

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    level: user.level,
    institution: user.institution,
  })
  const [goal, setGoal] = useState(String(user.dailyGoal))
  const [errors, setErrors] = useState({})

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))

  const saveProfile = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setErrors({ name: 'Nama tidak boleh kosong.' })
      return
    }
    setErrors({})
    updateProfile({ ...form, name: form.name.trim(), username: form.username.trim(), institution: form.institution.trim() })
    toast('Profil disimpan')
  }

  const saveGoal = (e) => {
    e.preventDefault()
    const minutes = Number(goal)
    if (!(minutes >= 5 && minutes <= 600)) {
      setErrors({ goal: 'Isi antara 5 sampai 600 menit.' })
      return
    }
    setErrors({})
    updateProfile({ dailyGoal: minutes })
    toast('Target harian disimpan')
  }

  return (
    <>
      <PageHeader
        title="Pengaturan"
        subtitle="Atur profil, privasi, dan integrasimu."
        action={<Badge color="bg-sand-deep">Disimpan di browser ini (demo)</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="primary" className="p-5 lg:row-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <UserRound className="size-5" aria-hidden="true" /> Profil
          </h2>
          <form onSubmit={saveProfile} noValidate className="flex flex-col gap-4">
            <Input label="Nama" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Username" autoComplete="username" value={form.username} onChange={set('username')} hint="Dipakai temanmu untuk mencarimu." />
            <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
            <Select label="Jenjang pendidikan" options={educationLevels} value={form.level} onChange={set('level')} />
            <Input label="Sekolah / kampus (opsional)" autoComplete="organization" value={form.institution} onChange={set('institution')} />
            <Button type="submit" className="self-start">Simpan profil</Button>
          </form>
        </Card>

        <Card color="bg-sand-deep" className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Target className="size-5" aria-hidden="true" /> Target belajar harian
          </h2>
          <form onSubmit={saveGoal} noValidate className="flex items-end gap-3">
            <Input className="flex-1" label="Menit per hari" type="number" min={5} max={600} value={goal} onChange={(e) => setGoal(e.target.value)} error={errors.goal} />
            <Button type="submit">Simpan</Button>
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
            value={user.privacy}
            onChange={(v) => { updateProfile({ privacy: v }); toast('Privasi diperbarui') }}
          />
        </Card>

        <Card color="bg-mist" className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <CalendarSync className="size-5" aria-hidden="true" /> Google Calendar
          </h2>
          <p className="mb-4 text-sm">Sinkronisasi satu arah: kegiatan dari GeezeStudy dikirim ke Google Calendar-mu. Perubahan di Google Calendar tidak masuk ke sini.</p>
          <div className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-3">
            <div>
              <p className="font-semibold">Sinkronkan kegiatan</p>
              <p className="text-sm text-ink/80">{user.calendarSync ? 'Aktif (simulasi)' : 'Belum aktif'}</p>
            </div>
            <Toggle
              label="Sinkronkan kegiatan ke Google Calendar"
              checked={user.calendarSync}
              onChange={(v) => { updateProfile({ calendarSync: v }); toast(v ? 'Sinkronisasi diaktifkan (simulasi)' : 'Sinkronisasi dimatikan') }}
            />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 text-xl font-semibold">Akun</h2>
          <p className="mb-3 text-sm text-ink/80">Keluar menghapus profil demo dari browser ini.</p>
          <Button variant="neutral" onClick={() => { logout(); toast('Kamu sudah keluar') }}>
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </Button>
        </Card>
      </div>
    </>
  )
}
