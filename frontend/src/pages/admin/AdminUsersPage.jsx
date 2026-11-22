import { useEffect, useState } from 'react'
import { KeyRound, UserCheck, UserX } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable'
import Input, { PasswordInput } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { educationLevels } from '@/lib/profile'

const roleFilters = [
  { value: '', label: 'Semua' },
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
]
const levelLabel = Object.fromEntries(educationLevels.map((l) => [l.value, l.label]))
const joinedFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function UsersTable({ resource, page, onPage }) {
  const toast = useToast()
  const { user: me } = useAuth()
  const [resetTarget, setResetTarget] = useState(null)
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'suspended' : 'active'
    try {
      await api.patch(`/admin/users/${u.id}`, { status: next })
      toast(next === 'suspended' ? `${u.name} ditangguhkan` : `${u.name} diaktifkan kembali`)
      resource.reload()
    } catch (error) {
      toast(errorMessage(error), 'error')
    }
  }

  const openReset = (u) => {
    setResetTarget(u)
    setForm({ password: '', confirm: '' })
    setErrors({})
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (!resetTarget) return
    const next = {}
    if (form.password.length < 8) next.password = 'Minimal 8 karakter.'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Gunakan kombinasi huruf dan angka.'
    if (form.confirm !== form.password) next.confirm = 'Belum sama dengan password baru.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    try {
      await api.post(`/admin/users/${resetTarget.id}/reset-password`, {
        password: form.password,
        password_confirmation: form.confirm,
      })
      toast(`Password sementara untuk ${resetTarget.name} diatur`, 'success', { description: 'Pengguna wajib membuat password baru saat masuk.' })
      setResetTarget(null)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { password: errorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Pengguna',
      render: (u) => (
        <div>
          <p className="font-semibold">{u.name}</p>
          <p className="text-xs text-ink/80">{u.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (u) => <Badge color={u.role === 'admin' ? 'bg-stone' : 'bg-mist'}>{u.role === 'admin' ? 'Admin' : 'Student'}</Badge> },
    { key: 'education_level', label: 'Jenjang', render: (u) => levelLabel[u.education_level] ?? '-' },
    { key: 'level', label: 'Level', render: (u) => `${u.level} · ${u.points} pts` },
    { key: 'created_at', label: 'Bergabung', render: (u) => joinedFmt.format(new Date(u.created_at)) },
    {
      key: 'status',
      label: 'Status',
      render: (u) => <Badge color={u.status === 'active' ? 'bg-moss' : 'bg-danger/15 text-danger'}>{u.status === 'active' ? 'Aktif' : 'Ditangguhkan'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (u) => (
        <div className="flex gap-1">
          <Button size="sm" variant="neutral" disabled={u.id === me.id} onClick={() => toggleStatus(u)} aria-label={`${u.status === 'active' ? 'Tangguhkan' : 'Aktifkan'} ${u.name}`}>
            {u.status === 'active' ? <UserX className="size-4" aria-hidden="true" /> : <UserCheck className="size-4" aria-hidden="true" />}
          </Button>
          <Button size="sm" variant="neutral" onClick={() => openReset(u)} aria-label={`Atur password sementara untuk ${u.name}`}>
            <KeyRound className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  const { data } = resource
  return (
    <>
      <DataTable caption="Daftar pengguna" columns={columns} rows={data.data} empty="Tidak ada pengguna yang cocok." />
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <p>{data.total} pengguna · halaman {data.current_page} dari {data.last_page}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="neutral" disabled={data.current_page <= 1} onClick={() => onPage(page - 1)}>Sebelumnya</Button>
          <Button size="sm" variant="neutral" disabled={data.current_page >= data.last_page} onClick={() => onPage(page + 1)}>Berikutnya</Button>
        </div>
      </div>

      <Modal
        open={Boolean(resetTarget)}
        onClose={() => !saving && setResetTarget(null)}
        title="Atur password sementara"
        description={resetTarget ? `Untuk ${resetTarget.name} (${resetTarget.email}) yang tidak bisa memakai "Lupa password". Saat masuk, ia wajib membuat password baru sendiri. Sampaikan password ini secara langsung, bukan di grup.` : ''}
        size="sm"
        footer={(
          <>
            <Button variant="neutral" disabled={saving} onClick={() => setResetTarget(null)}>Batal</Button>
            <Button type="submit" form="admin-reset-pw-form" loading={saving}>Simpan password sementara</Button>
          </>
        )}
      >
        <form id="admin-reset-pw-form" onSubmit={submitReset} noValidate className="flex flex-col gap-4">
          <PasswordInput
            label="Password sementara"
            required
            showStrength
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            hint="Minimal 8 karakter, kombinasi huruf dan angka."
          />
          <PasswordInput
            label="Ulangi password sementara"
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            error={errors.confirm}
          />
        </form>
      </Modal>
    </>
  )
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)

  // Tunda pencarian 300 ms supaya tidak memanggil server di setiap ketukan.
  useEffect(() => {
    const id = setTimeout(() => { setDebounced(query.trim()); setPage(1) }, 300)
    return () => clearTimeout(id)
  }, [query])

  const params = { page, ...(debounced && { q: debounced }), ...(role && { role }) }
  const resource = useResource('/admin/users', params)

  return (
    <>
      <PageHeader title="Pengguna" subtitle="Kelola akun Student dan Admin. Admin tidak bisa mengubah Points pengguna." />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <Input className="w-full sm:w-72" label="Cari nama atau email" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SegmentedControl label="Filter role" options={roleFilters} value={role} onChange={(v) => { setRole(v); setPage(1) }} />
      </div>

      <AsyncView resource={resource} rows={4}>{() => <UsersTable resource={resource} page={page} onPage={setPage} />}</AsyncView>
    </>
  )
}
