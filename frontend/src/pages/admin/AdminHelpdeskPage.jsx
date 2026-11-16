import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import AttachmentLink from '@/components/helpdesk/AttachmentLink'
import RecoveryPanel from '@/components/helpdesk/RecoveryPanel'
import StatusBadge from '@/components/helpdesk/StatusBadge'
import TicketThread from '@/components/helpdesk/TicketThread'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { refreshBadges } from '@/lib/badges'
import { categories, categoryLabel, statuses } from '@/lib/helpdesk'
import { dayTime } from '@/lib/mappers'
import { educationLabel } from '@/lib/profile'

const categoryOptions = [{ value: '', label: 'Semua kategori' }, ...categories.map((c) => ({ value: c.value, label: c.label }))]
const statusOptions = statuses.map((s) => ({ value: s.value, label: s.label }))

function Detail({ id, onChanged }) {
  const toast = useToast()
  const resource = useResource(`/admin/helpdesk/${id}`)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const update = (data) => { resource.mutate(() => data); onChanged(); refreshBadges() }

  const send = async (e, t) => {
    e.preventDefault()
    if (body.trim().length < 2) return setError('Tulis balasan dulu.')
    setSending(true)
    try {
      const { data } = await api.post(`/admin/helpdesk/${id}/replies`, { body: body.trim(), ...(status && status !== t.status && { status }) })
      update(data)
      setBody('')
      setStatus('')
      setError('')
      toast.success('Balasan terkirim')
    } catch (err) {
      setError(fieldErrors(err).body ?? errorMessage(err))
    } finally {
      setSending(false)
    }
    return undefined
  }

  const changeStatus = async (value) => {
    try {
      const { data } = await api.patch(`/admin/helpdesk/${id}/status`, { status: value })
      update(data)
      toast.success('Status diperbarui')
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  return (
    <AsyncView resource={resource} rows={3}>
      {(t) => (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-ink-2">{t.code} · {categoryLabel[t.category]} · dibuat {dayTime(t.created_at)}</p>
            <h3 className="mt-0.5 text-lg font-semibold">{t.subject}</h3>
          </div>

          <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-canvas p-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-ink-2">Pelapor</dt><dd className="font-medium">{t.requester_name}{t.is_guest && <span className="ml-1.5 text-xs font-normal text-ink-2">(belum masuk)</span>}</dd></div>
            <div><dt className="text-xs text-ink-2">Email kontak</dt><dd className="break-all font-medium">{t.contact_email}</dd></div>
            {t.user && (
              <>
                <div><dt className="text-xs text-ink-2">Akun</dt><dd className="font-medium">{t.user.email}{!t.user.email_verified && <span className="ml-1.5 text-xs font-normal text-warning">belum terverifikasi</span>}</dd></div>
                <div><dt className="text-xs text-ink-2">Jenjang</dt><dd className="font-medium">{[educationLabel[t.user.education_level], t.user.institution].filter(Boolean).join(' · ') || '-'}{t.user.status === 'suspended' && ' · ditangguhkan'}</dd></div>
              </>
            )}
            {t.meta?.education_level && <div><dt className="text-xs text-ink-2">Jenjang (isian pelapor)</dt><dd className="font-medium">{educationLabel[t.meta.education_level]}</dd></div>}
            {t.meta?.nim && <div><dt className="text-xs text-ink-2">NIM / nomor induk</dt><dd className="font-medium">{t.meta.nim}</dd></div>}
            {t.meta?.old_email && <div><dt className="text-xs text-ink-2">Perkiraan email lama</dt><dd className="break-all font-medium">{t.meta.old_email}</dd></div>}
          </dl>

          {t.has_attachment && <AttachmentLink path={`/admin/helpdesk/${t.id}/attachment`} name={t.attachment_name} size={t.attachment_size} />}

          <TicketThread messages={t.messages} viewer="admin" />

          {t.category === 'account_recovery' && t.status !== 'closed' && <RecoveryPanel ticket={t} onDone={update} />}

          {t.status === 'closed' ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-4 text-sm text-ink-2">
              Tiket ini sudah ditutup.
              <Button size="sm" variant="secondary" onClick={() => changeStatus('in_progress')}>Buka kembali</Button>
            </div>
          ) : (
            <form onSubmit={(e) => send(e, t)} noValidate className="flex flex-col gap-3 border-t border-line pt-4">
              <Textarea label="Balasan untuk pelapor" rows={3} maxLength={3000} value={body} onChange={(e) => setBody(e.target.value)} error={error} hint={t.is_guest ? 'Balasan dikirim ke email kontak. Jangan minta atau menulis password.' : 'Pelapor menerima notifikasi. Jangan minta atau menulis password.'} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <Select className="sm:w-56" label="Ubah status" options={[{ value: '', label: 'Tetap sama' }, ...statusOptions]} value={status} onChange={(e) => setStatus(e.target.value)} />
                <Button type="submit" loading={sending}><Send aria-hidden="true" /> Kirim balasan</Button>
              </div>
              {t.status !== 'resolved' && (
                <Button variant="ghost" size="sm" className="self-start" onClick={() => changeStatus('resolved')}>Tandai selesai tanpa balasan</Button>
              )}
            </form>
          )}
        </div>
      )}
    </AsyncView>
  )
}

export default function AdminHelpdeskPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const id = setTimeout(() => { setDebounced(query.trim()); setPage(1) }, 300)
    return () => clearTimeout(id)
  }, [query])

  const resource = useResource('/admin/helpdesk', { page, ...(debounced && { q: debounced }), ...(category && { category }), ...(status && { status }) })
  const counts = resource.data?.counts ?? {}
  const statusFilters = [
    { value: '', label: 'Semua' },
    ...statuses.map((s) => ({ value: s.value, label: counts[s.value] ? `${s.label} (${counts[s.value]})` : s.label })),
  ]

  const columns = [
    { key: 'code', label: 'Tiket', className: 'whitespace-nowrap font-semibold', render: (t) => t.code },
    { key: 'requester_name', label: 'Pengguna', render: (t) => <span>{t.requester_name}{t.is_guest && <span className="block text-xs text-ink-2">belum masuk</span>}</span> },
    { key: 'category', label: 'Kategori', className: 'whitespace-nowrap', render: (t) => categoryLabel[t.category] },
    { key: 'subject', label: 'Judul', className: 'md:max-w-xs', render: (t) => <span className="line-clamp-2 break-words">{t.subject}</span> },
    { key: 'created_at', label: 'Dibuat', className: 'whitespace-nowrap', render: (t) => dayTime(t.created_at) },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'actions', label: 'Aksi', render: (t) => <Button size="sm" variant="secondary" onClick={() => setOpenId(t.id)} aria-label={`Buka tiket ${t.code}`}>Buka</Button> },
  ]

  return (
    <>
      <PageHeader title="Helpdesk & Account Assistance" subtitle="Laporan bug, kendala login, dan bantuan akun dari pengguna." />

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input className="w-full sm:w-72" label="Cari nomor tiket atau nama" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select className="w-full sm:w-56" label="Kategori" options={categoryOptions} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} />
        </div>
        <div className="thin-scroll -mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedControl label="Filter status" options={statusFilters} value={status} onChange={(v) => { setStatus(v); setPage(1) }} size="sm" className="flex-nowrap" />
        </div>
      </div>

      <AsyncView resource={resource} rows={4}>
        {({ tickets }) => (
          <>
            <DataTable caption="Daftar tiket Helpdesk" columns={columns} rows={tickets.data} empty="Belum ada tiket yang cocok." />
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <p>{tickets.total} tiket · halaman {tickets.current_page} dari {tickets.last_page}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={tickets.current_page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="secondary" disabled={tickets.current_page >= tickets.last_page} onClick={() => setPage(page + 1)}>Berikutnya</Button>
              </div>
            </div>
          </>
        )}
      </AsyncView>

      <Modal open={openId !== null} onClose={() => setOpenId(null)} title="Detail tiket" size="lg">
        {openId !== null && <Detail id={openId} onChanged={resource.reload} />}
      </Modal>
    </>
  )
}
