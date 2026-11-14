import { useState } from 'react'
import { LogOut } from 'lucide-react'
import AvatarPicker from '@/components/profile/AvatarPicker'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Toggle from '@/components/ui/Toggle'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { educationLevels, institutionField } from '@/lib/profile'

// Satu baris pengaturan: judul + penjelasan di kiri, kontrol di kanan. Dipisah garis, bukan kartu bertumpuk.
function Row({ title, description, children }) {
  return (
    <div className="grid gap-4 py-6 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateProfile, setUser, logout } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const [form, setForm] = useState({ name: user.name, email: user.email, education_level: user.education_level ?? 'sma', institution: user.institution ?? '' })
  const [goal, setGoal] = useState(String(user.daily_goal_minutes))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)

  const set = (f) => (e) => setForm((cur) => ({ ...cur, [f]: e.target.value }))
  const inst = institutionField[form.education_level]

  const save = async (key, patch, success) => {
    setSaving(key)
    try {
      await updateProfile(patch)
      setErrors({})
      toast(success)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(fields)
      if (!Object.keys(fields).length) toast(errorMessage(error), 'error')
    } finally {
      setSaving('')
    }
  }

  const saveProfile = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setErrors({ name: 'Nama tidak boleh kosong.' })
    const emailChanged = form.email.trim() !== user.email
    return save('profile', { name: form.name.trim(), email: form.email.trim(), education_level: form.education_level, institution: form.institution.trim() || null },
      emailChanged ? 'Profil disimpan. Cek email barumu untuk verifikasi.' : 'Profil disimpan')
  }

  const saveGoal = (e) => {
    e.preventDefault()
    const minutes = Number(goal)
    if (!(minutes >= 10 && minutes <= 600)) return setErrors({ daily_goal_minutes: 'Isi antara 10 sampai 600 menit.' })
    return save('goal', { daily_goal_minutes: minutes }, 'Target harian disimpan')
  }

  const uploadAvatar = async (file) => {
    setAvatarBusy(true)
    const body = new FormData()
    body.append('avatar', file)
    try {
      const { data } = await toast.promise(api.post('/user/avatar', body), { loading: 'Mengunggah foto...', success: 'Foto profil diperbarui', error: (err) => errorMessage(err) })
      setUser(data)
    } catch { /* pesan sudah tampil */ } finally {
      setAvatarBusy(false)
    }
  }

  const removeAvatar = async () => {
    if (!(await confirm({ title: 'Hapus foto profil?', description: 'Avatar inisial akan dipakai sebagai gantinya.', confirmLabel: 'Hapus foto', tone: 'danger' }))) return
    setAvatarBusy(true)
    try {
      const { data } = await api.delete('/user/avatar')
      setUser(data)
      toast.info('Foto profil dihapus')
    } catch (error) {
      toast(errorMessage(error), 'error')
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Profil, target belajar, privasi, dan akun." />

      <div className="divide-y divide-line border-y border-line">
        <Row title="Foto profil" description="Opsional. Tanpa foto, inisial namamu dipakai sebagai avatar.">
          <AvatarPicker name={user.name} currentUrl={user.avatar_url} onUpload={uploadAvatar} onRemove={removeAvatar} busy={avatarBusy} />
        </Row>

        <Row title="Profil" description="Nama dan institusi terlihat oleh temanmu.">
          <form onSubmit={saveProfile} noValidate className="grid max-w-xl gap-4">
            <Input label="Nama" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} hint="Mengganti email meminta verifikasi ulang." />
            <div>
              <p className="mb-1.5 text-sm font-medium">Jenjang pendidikan</p>
              <SegmentedControl label="Jenjang pendidikan" options={educationLevels.map((l) => ({ ...l, label: l.value === 'sma' ? 'SMA' : l.label }))} value={form.education_level} onChange={(v) => setForm((f) => ({ ...f, education_level: v }))} />
            </div>
            <Input label={inst.label} autoComplete="organization" placeholder={inst.placeholder} value={form.institution} onChange={set('institution')} error={errors.institution} />
            <div><Button type="submit" loading={saving === 'profile'}>Simpan profil</Button></div>
          </form>
        </Row>

        <Row title="Target belajar harian" description="Dipakai di Beranda, Study Timer, dan misi harian.">
          <form onSubmit={saveGoal} noValidate className="flex max-w-sm items-start gap-3">
            <Input className="flex-1" label="Menit per hari" labelHidden type="number" min={10} max={600} value={goal} onChange={(e) => setGoal(e.target.value)} error={errors.daily_goal_minutes} hint="Antara 10 sampai 600 menit." />
            <Button type="submit" variant="secondary" loading={saving === 'goal'}>Simpan</Button>
          </form>
        </Row>

        <Row title="Privasi" description="Atur apa yang bisa dilihat temanmu.">
          <div className="flex max-w-xl items-center justify-between gap-4 rounded-xl bg-surface p-4 ring-1 ring-line">
            <div>
              <p className="text-sm font-semibold">Tampilkan statistik ke teman</p>
              <p className="text-sm text-ink-2">Level, streak, dan jam belajar minggu ini.</p>
            </div>
            <Toggle label="Tampilkan statistik ke teman" checked={user.privacy_show_progress} onChange={(v) => save('privacy', { privacy_show_progress: v }, v ? 'Statistik terlihat oleh teman' : 'Statistik disembunyikan')} />
          </div>
        </Row>

        <Row title="Google Calendar" description="Sinkronisasi satu arah dari GeezeStudy ke Google Calendar.">
          <div className="flex max-w-xl items-center justify-between gap-4 rounded-xl bg-surface p-4 ring-1 ring-line">
            <div>
              <p className="text-sm font-semibold">Sinkronkan kegiatan</p>
              <p className="text-sm text-ink-2">Belum tersambung ke Google. Pilihanmu disimpan untuk saat fitur ini aktif.</p>
            </div>
            <Toggle label="Sinkronkan kegiatan ke Google Calendar" checked={user.calendar_sync} onChange={(v) => save('sync', { calendar_sync: v }, v ? 'Pilihan sinkronisasi disimpan' : 'Sinkronisasi dimatikan')} />
          </div>
        </Row>

        <Row title="Akun" description="Keluar mengakhiri sesi di perangkat ini.">
          <Button
            variant="secondary"
            onClick={async () => {
              if (await confirm({ title: 'Keluar dari GeezeStudy?', description: 'Timer yang sedang berjalan di perangkat ini akan dihentikan.', confirmLabel: 'Keluar' })) {
                try { await logout(); toast.info('Kamu sudah keluar') } catch { toast('Gagal keluar. Coba lagi.', 'error') }
              }
            }}
          >
            <LogOut aria-hidden="true" /> Keluar
          </Button>
        </Row>
      </div>
    </>
  )
}
