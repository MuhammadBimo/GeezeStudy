import { useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'

const tabs = [
  { value: 'profil', label: 'Profil' },
  { value: 'pengaturan', label: 'Pengaturan' },
]

// Profil dan Pengaturan dalam satu menu. Tab aktif disimpan di URL (?tab=pengaturan) agar bisa ditautkan.
export default function ProfileSettingsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'pengaturan' ? 'pengaturan' : 'profil'

  return (
    <>
      <PageHeader title="Profil & Pengaturan" subtitle="Ringkasan perjalanan belajarmu, serta profil, target, privasi, dan akun.">
        <SegmentedControl label="Bagian" options={tabs} value={tab} onChange={(v) => setParams(v === 'profil' ? {} : { tab: v }, { replace: true })} />
      </PageHeader>
      {tab === 'profil' ? <ProfilePage /> : <SettingsPage />}
    </>
  )
}
