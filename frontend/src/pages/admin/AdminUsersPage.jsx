import { useState } from 'react'
import { KeyRound, Trash2, UserCheck, UserX } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useToast } from '@/hooks/useToast'
import { initialUsers } from '@/lib/mockAdmin'

const roleFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'Student', label: 'Student' },
  { value: 'Admin', label: 'Admin' },
]

export default function AdminUsersPage() {
  const toast = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')

  const q = query.trim().toLowerCase()
  const rows = users.filter(
    (u) => (role === 'all' || u.role === role) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  )

  const toggleStatus = (u) => {
    const next = u.status === 'active' ? 'suspended' : 'active'
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: next } : x)))
    toast(next === 'suspended' ? `${u.name} ditangguhkan` : `${u.name} diaktifkan kembali`)
  }
  const remove = (u) => {
    if (!window.confirm(`Hapus akun ${u.name}? Tindakan ini tidak bisa dibatalkan.`)) return
    setUsers((prev) => prev.filter((x) => x.id !== u.id))
    toast('Akun dihapus')
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
    { key: 'role', label: 'Role', render: (u) => <Badge color={u.role === 'Admin' ? 'bg-stone' : 'bg-mist'}>{u.role}</Badge> },
    { key: 'level', label: 'Jenjang' },
    { key: 'joined', label: 'Bergabung' },
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
          <Button size="sm" variant="neutral" onClick={() => toggleStatus(u)} aria-label={`${u.status === 'active' ? 'Tangguhkan' : 'Aktifkan'} ${u.name}`}>
            {u.status === 'active' ? <UserX className="size-4" aria-hidden="true" /> : <UserCheck className="size-4" aria-hidden="true" />}
          </Button>
          <Button size="sm" variant="neutral" onClick={() => toast(`Simulasi: tautan reset dikirim ke ${u.email}`)} aria-label={`Reset password ${u.name}`}>
            <KeyRound className="size-4" aria-hidden="true" />
          </Button>
          <Button size="sm" variant="neutral" onClick={() => remove(u)} aria-label={`Hapus ${u.name}`}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Pengguna"
        subtitle="Kelola akun Student dan Admin."
        action={<Badge color="bg-sand-deep">Data contoh (sementara)</Badge>}
      />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <Input className="w-full sm:w-72" label="Cari nama atau email" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SegmentedControl label="Filter role" options={roleFilters} value={role} onChange={setRole} />
      </div>

      <DataTable caption="Daftar pengguna" columns={columns} rows={rows} empty="Tidak ada pengguna yang cocok." />
    </>
  )
}
