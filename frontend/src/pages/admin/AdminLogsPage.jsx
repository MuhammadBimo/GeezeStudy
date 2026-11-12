import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { adminActivity, errorLogs } from '@/lib/mockAdmin'

const tabs = [
  { value: 'activity', label: 'Aktivitas admin' },
  { value: 'errors', label: 'Error sistem' },
]

const activityColumns = [
  { key: 'when', label: 'Waktu', className: 'whitespace-nowrap' },
  { key: 'actor', label: 'Admin', className: 'whitespace-nowrap font-bold' },
  { key: 'action', label: 'Tindakan' },
]

const errorColumns = [
  { key: 'when', label: 'Waktu', className: 'whitespace-nowrap' },
  {
    key: 'level',
    label: 'Level',
    render: (r) => <Badge color={r.level === 'error' ? 'bg-pink' : 'bg-yellow'}>{r.level === 'error' ? 'Error' : 'Peringatan'}</Badge>,
  },
  { key: 'source', label: 'Sumber', className: 'whitespace-nowrap font-mono text-xs' },
  { key: 'message', label: 'Pesan' },
]

export default function AdminLogsPage() {
  const [tab, setTab] = useState('activity')

  return (
    <>
      <PageHeader
        title="Log"
        subtitle="Pantau aktivitas administrasi dan error sistem."
        action={<Badge color="bg-yellow">Data contoh (sementara)</Badge>}
      />
      <SegmentedControl className="mb-5" label="Jenis log" options={tabs} value={tab} onChange={setTab} />

      {tab === 'activity' ? (
        <DataTable caption="Log aktivitas admin" columns={activityColumns} rows={adminActivity} />
      ) : (
        <DataTable caption="Log error sistem" columns={errorColumns} rows={errorLogs} />
      )}
    </>
  )
}
