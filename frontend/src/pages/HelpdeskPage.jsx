import { useEffect, useState } from 'react'
import { LifeBuoy, Plus, Send } from 'lucide-react'
import AttachmentLink from '@/components/helpdesk/AttachmentLink'
import StatusBadge from '@/components/helpdesk/StatusBadge'
import TicketForm from '@/components/helpdesk/TicketForm'
import TicketThread from '@/components/helpdesk/TicketThread'
import AsyncView from '@/components/ui/AsyncView'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Textarea from '@/components/ui/Textarea'
import { useAuth } from '@/hooks/useAuth'
import { useResource } from '@/hooks/useResource'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { refreshBadges } from '@/lib/badges'
import { categoryLabel } from '@/lib/helpdesk'
import { relativeTime } from '@/lib/mappers'

function TicketDetail({ id, onChanged, onNew }) {
  const toast = useToast()
  const resource = useResource(`/helpdesk/${id}`)
  // Membuka tiket menandai notifikasinya terbaca di server; segarkan lencana di sidebar.
  useEffect(() => { if (resource.data) refreshBadges() }, [resource.data])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const send = async (e) => {
    e.preventDefault()
    if (body.trim().length < 2) return setError('Tulis balasanmu dulu.')
    setSending(true)
    try {
      const { data } = await api.post(`/helpdesk/${id}/replies`, { body: body.trim() })
      resource.mutate(() => data)
      setBody('')
      setError('')
      onChanged()
      toast.success('Balasan terkirim')
    } catch (err) {
      setError(fieldErrors(err).body ?? errorMessage(err))
    } finally {
      setSending(false)
    }
    return undefined
  }

  return (
    <AsyncView resource={resource} rows={3}>
      {(t) => {
        const waiting = t.status === 'pending' && !t.messages.some((m) => m.is_staff)
        return (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-2">
            <StatusBadge status={t.status} />
            <span className="font-medium text-ink">{t.code}</span>
            <span>{categoryLabel[t.category]}</span>
          </div>

          {t.has_attachment && <AttachmentLink path={`/helpdesk/${t.id}/attachment`} name={t.attachment_name} size={t.attachment_size} />}

          <TicketThread messages={t.messages} />

          {waiting && (
            <p role="status" className="rounded-xl bg-sage/60 px-4 py-3 text-sm text-ink-2">
              <strong className="font-semibold text-ink">Laporanmu sudah terkirim.</strong> Sekarang menunggu balasan admin. Balasannya akan muncul di sini dan di Notifikasi.
            </p>
          )}

          {t.status === 'closed' ? (
            <div className="rounded-xl bg-canvas p-4 text-sm text-ink-2">
              Tiket ini sudah ditutup. Masih ada kendala? <button type="button" onClick={onNew} className="font-semibold text-accent underline-offset-4 hover:underline">Buat laporan baru</button>.
            </div>
          ) : (
            <form onSubmit={send} noValidate className="flex flex-col gap-3 border-t border-line pt-4">
              {t.status === 'waiting_user' && <p className="text-sm font-medium text-sand-ink">Admin menunggu jawabanmu.</p>}
              <Textarea label={t.status === 'resolved' ? 'Masih ada kendala? Balas di sini' : waiting ? 'Tambah keterangan (opsional)' : 'Balasanmu'} rows={3} maxLength={3000} value={body} onChange={(e) => setBody(e.target.value)} error={error} />
              <Button type="submit" loading={sending} className="self-end"><Send aria-hidden="true" /> {waiting ? 'Kirim keterangan' : 'Kirim balasan'}</Button>
            </form>
          )}
        </div>
        )
      }}
    </AsyncView>
  )
}

export default function HelpdeskPage() {
  const { user } = useAuth()
  const toast = useToast()
  const resource = useResource('/helpdesk')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState(null)

  const newButton = <Button onClick={() => setCreating(true)}><Plus aria-hidden="true" /> Buat laporan</Button>

  return (
    <>
      <PageHeader
        title="Bantuan"
        subtitle="Ada bug, kendala akun, atau pertanyaan? Kirim laporan dan pantau balasan admin di sini."
        action={newButton}
      />

      <AsyncView resource={resource}>
        {({ tickets }) => (tickets.length === 0 ? (
          <div className="rounded-panel border border-line bg-surface">
            <EmptyState illustration="inbox" title="Belum ada laporan" description="Kalau ada yang tidak berjalan semestinya, ceritakan saja. Admin akan membalas lewat halaman ini." action={newButton} />
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs" aria-label="Laporanmu">
            {tickets.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setOpenId(t.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-left transition-colors hover:bg-hover/70 sm:flex-nowrap sm:px-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage text-accent"><LifeBuoy className="size-4.5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block truncate font-semibold">{t.subject}</span>
                    <span className="block truncate text-sm text-ink-2">{t.code} · {categoryLabel[t.category]} · {relativeTime(t.last_activity_at)}</span>
                  </span>
                  <StatusBadge status={t.status} />
                </button>
              </li>
            ))}
          </ul>
        ))}
      </AsyncView>

      <Modal open={creating} onClose={() => setCreating(false)} title="Buat laporan" description="Semakin jelas ceritamu, semakin cepat admin bisa membantu." size="md">
        <TicketForm
          user={user}
          onCancel={() => setCreating(false)}
          onDone={(t) => {
            setCreating(false)
            resource.reload()
            toast.success(`Laporan terkirim. Nomor tiket ${t.code}`)
            setOpenId(t.id)
          }}
        />
      </Modal>

      <Modal open={openId !== null} onClose={() => setOpenId(null)} title="Detail laporan" size="lg">
        {openId !== null && (
          <TicketDetail id={openId} onChanged={resource.reload} onNew={() => { setOpenId(null); setCreating(true) }} />
        )}
      </Modal>
    </>
  )
}
