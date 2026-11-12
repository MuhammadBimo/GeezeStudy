import { useEffect, useState } from 'react'
import { KeyRound, UserCheck, UserX } from 'lucide-react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage } from '@/lib/api'
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

  const sendReset = async (u) => {
    try {
      await api.post(`/admin/users/${u.id}/reset-password`)
      toast(`Tautan reset dikirim ke ${u.email}`)
    } catch (error) {
      toast(errorMessage(error), 'error')
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
          <Button size="sm" variant="neutral" onClick={() => sendReset(u)} aria-label={`Kirim tautan reset password ke ${u.name}`}>
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
      <PageHeader title="Pengguna" subtitle="Kelola akun Student dan Admin. Admin tidak bisa mengubah Points atau password pengguna." />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <Input className="w-full sm:w-72" label="Cari nama atau email" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SegmentedControl label="Filter role" options={roleFilters} value={role} onChange={(v) => { setRole(v); setPage(1) }} />
      </div>

      <AsyncView resource={resource} rows={4}>{() => <UsersTable resource={resource} page={page} onPage={setPage} />}</AsyncView>
    </>
  )
}
