import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Lock, Send } from 'lucide-react'
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
import { useConfirm } from '@/hooks/useConfirm'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { refreshBadges } from '@/lib/badges'
import { adminStatusOptions, categories, categoryLabel, isClosing, statuses } from '@/lib/helpdesk'
import { dayTime } from '@/lib/mappers'
import { educationLabel } from '@/lib/profile'

const categoryOptions = [{ value: '', label: 'Semua kategori' }, ...categories.map((c) => ({ value: c.value, label: c.label }))]

const closeCopy = {
  title: 'Tutup laporan ini?',
  description: 'Laporan akan ditutup dan percakapannya terkunci: tidak ada yang bisa membalas lagi. Riwayat tetap bisa dilihat.',
  confirmLabel: 'Tutup laporan',
}

function Detail({ id, onChanged }) {
  const toast = useToast()
  const confirm = useConfirm()
  const resource = useResource(`/admin/helpdesk/${id}`)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const update = (data) => { resource.mutate(() => data); onChanged(); refreshBadges() }

  // Balasan opsional: boleh hanya membalas, hanya mengubah status, atau keduanya.
  const send = async (e, t) => {
    e.preventDefault()
    const text = body.trim()
    const target = status && status !== t.status ? status : ''
    if (!text && !target) return setError('Tulis balasan atau pilih status baru.')
    if (isClosing(target) && !(await confirm(closeCopy))) return undefined

    setSending(true)
    try {
      const { data } = await api.post(`/admin/helpdesk/${id}/replies`, { ...(text && { body: text }), ...(target && { status: target }) })
      update(data)
      setBody('')
      setStatus('')
      setError('')
      toast.success(isClosing(target) ? 'Laporan berhasil ditutup' : text ? 'Balasan terkirim' : 'Status diperbarui')
    } catch (err) {
      const f = fieldErrors(err)
      setError(f.body ?? f.status ?? errorMessage(err))
    } finally {
      setSending(false)
    }
    return undefined
  }

  const closeTicket = async () => {
    if (!(await confirm(closeCopy))) return
    try {
      const { data } = await api.patch(`/admin/helpdesk/${id}/status`, { status: 'resolved' })
      update(data)
      toast.success('Laporan berhasil ditutup')
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const submitLabel = (t) => {
    const text = body.trim()
    const target = status && status !== t.status ? status : ''
    if (text) return isClosing(target) ? 'Kirim dan tutup laporan' : 'Kirim balasan'
    if (target) return isClosing(target) ? 'Tutup laporan' : 'Simpan status'
    return 'Kirim'
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
            <p role="status" className="flex items-start gap-2.5 rounded-xl bg-canvas p-4 text-sm text-ink-2">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Laporan ini sudah ditutup. Percakapan terkunci dan tidak bisa dibalas lagi, tetapi riwayatnya tetap bisa dibaca.
            </p>
          ) : (
            <form onSubmit={(e) => send(e, t)} noValidate className="flex flex-col gap-3 border-t border-line pt-4">
              <Textarea
                label="Balasan (opsional)"
                rows={3}
                maxLength={3000}
                value={body}
                onChange={(e) => { setBody(e.target.value); setError('') }}
                error={error}
                hint={`${t.is_guest ? 'Balasan dikirim ke email kontak.' : 'Pelapor menerima notifikasi.'} Kosongkan untuk hanya mengubah status. Jangan minta atau menulis password.`}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <Select className="sm:w-60" label="Ubah status" options={[{ value: '', label: 'Tetap sama' }, ...adminStatusOptions]} value={status} onChange={(e) => { setStatus(e.target.value); setError('') }} />
                <Button type="submit" loading={sending}><Send aria-hidden="true" /> {submitLabel(t)}</Button>
              </div>
              <Button variant="ghost" size="sm" className="self-start" onClick={closeTicket}>Selesaikan dan tutup laporan</Button>
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
  // Kategori disimpan di URL (?kategori=...) agar submenu sidebar "Account Assistance" bisa menautkannya.
  const [params, setParams] = useSearchParams()
  const category = categories.some((c) => c.value === params.get('kategori')) ? params.get('kategori') : ''
  const setCategory = (value) => setParams((p) => { if (value) p.set('kategori', value); else p.delete('kategori'); return p }, { replace: true })
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
    { key: 'code', label: 'No. laporan', className: 'whitespace-nowrap font-semibold', render: (t) => t.code },
    { key: 'requester_name', label: 'Pengguna', render: (t) => <span>{t.requester_name}{t.is_guest && <span className="block text-xs text-ink-2">belum masuk</span>}</span> },
    { key: 'category', label: 'Kategori', className: 'whitespace-nowrap', render: (t) => categoryLabel[t.category] },
    { key: 'subject', label: 'Judul', className: 'md:max-w-xs', render: (t) => <span className="line-clamp-2 break-words">{t.subject}</span> },
    { key: 'created_at', label: 'Dibuat', className: 'whitespace-nowrap', render: (t) => dayTime(t.created_at) },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'actions', label: 'Aksi', render: (t) => <Button size="sm" variant="secondary" onClick={() => setOpenId(t.id)} aria-label={`Buka laporan ${t.code}`}>Buka</Button> },
  ]

  return (
    <>
      <PageHeader title="Helpdesk & Account Assistance" subtitle="Laporan bug, kendala login, dan bantuan akun dari pengguna." />

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input className="w-full sm:w-72" label="Cari nomor laporan atau nama" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select className="w-full sm:w-56" label="Kategori" options={categoryOptions} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} />
        </div>
        <div className="thin-scroll -mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedControl label="Filter status" options={statusFilters} value={status} onChange={(v) => { setStatus(v); setPage(1) }} size="sm" className="flex-nowrap" />
        </div>
      </div>

      <AsyncView resource={resource} rows={4}>
        {({ tickets }) => (
          <>
            <DataTable caption="Daftar laporan Helpdesk" columns={columns} rows={tickets.data} empty="Belum ada laporan yang cocok." />
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <p>{tickets.total} laporan · halaman {tickets.current_page} dari {tickets.last_page}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={tickets.current_page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="secondary" disabled={tickets.current_page >= tickets.last_page} onClick={() => setPage(page + 1)}>Berikutnya</Button>
              </div>
            </div>
          </>
        )}
      </AsyncView>

      <Modal open={openId !== null} onClose={() => setOpenId(null)} title="Detail laporan" size="lg">
        {openId !== null && <Detail id={openId} onChanged={resource.reload} />}
      </Modal>
    </>
  )
}
