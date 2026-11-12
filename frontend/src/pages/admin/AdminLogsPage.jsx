import { useState } from 'react'
import AsyncView from '@/components/ui/AsyncView'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useResource } from '@/hooks/useResource'
import { dayTime } from '@/lib/mappers'

const levels = [
  { value: '', label: 'Semua' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Peringatan' },
  { value: 'error', label: 'Error' },
]
const levelBadge = {
  info: { label: 'Info', color: 'bg-mist' },
  warning: { label: 'Peringatan', color: 'bg-clay' },
  error: { label: 'Error', color: 'bg-danger/15 text-danger' },
}

const columns = [
  { key: 'created_at', label: 'Waktu', className: 'whitespace-nowrap', render: (r) => dayTime(r.created_at) },
  { key: 'level', label: 'Level', render: (r) => <Badge color={levelBadge[r.level].color}>{levelBadge[r.level].label}</Badge> },
  { key: 'actor', label: 'Admin', className: 'whitespace-nowrap font-semibold', render: (r) => r.actor?.name ?? 'Sistem' },
  { key: 'action', label: 'Tindakan' },
]

export default function AdminLogsPage() {
  const [level, setLevel] = useState('')
  const [page, setPage] = useState(1)
  const resource = useResource('/admin/logs', { page, ...(level && { level }) })

  return (
    <>
      <PageHeader title="Log" subtitle="Pantau aktivitas administrasi dan error sistem." />
      <SegmentedControl className="mb-5" label="Level log" options={levels} value={level} onChange={(v) => { setLevel(v); setPage(1) }} />

      <AsyncView resource={resource} rows={4}>
        {(data) => (
          <>
            <DataTable caption="Log aktivitas dan sistem" columns={columns} rows={data.data} empty="Belum ada log." />
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <p>{data.total} catatan · halaman {data.current_page} dari {data.last_page}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="neutral" disabled={data.current_page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="neutral" disabled={data.current_page >= data.last_page} onClick={() => setPage(page + 1)}>Berikutnya</Button>
              </div>
            </div>
          </>
        )}
      </AsyncView>
    </>
  )
}
