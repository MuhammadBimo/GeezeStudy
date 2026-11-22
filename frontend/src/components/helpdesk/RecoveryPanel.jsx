import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/hooks/useToast'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { educationLabel } from '@/lib/profile'
import { dayTime } from '@/lib/mappers'

function AccountCard({ account, children }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 text-sm">
      <p className="font-semibold">{account.name}</p>
      <p className="text-ink-2">{account.email}</p>
      <p className="mt-1 text-xs text-ink-2">
        {[educationLabel[account.education_level], account.institution, `bergabung ${dayTime(account.created_at)}`].filter(Boolean).join(' · ')}
      </p>
      {children}
    </div>
  )
}

/**
 * Pemulihan akses akun untuk laporan "Lupa akun atau email". Admin mencocokkan data pelapor dengan akun,
 * memverifikasi kepemilikan di luar aplikasi, lalu mengganti email ke alamat kontak pelapor.
 * Email baru tidak bisa diketik bebas dan password tidak pernah terlihat atau diubah di sini.
 */
export default function RecoveryPanel({ ticket, onDone }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [picked, setPicked] = useState(null)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const account = ticket.user ?? picked
  const minor = ['sd', 'smp'].includes(ticket.meta?.education_level) || ['sd', 'smp'].includes(account?.education_level)

  // Cari akun Student, ditunda 300 ms agar tidak memanggil server di setiap ketukan.
  useEffect(() => {
    if (ticket.user || query.trim().length < 2) return undefined
    let cancelled = false
    const id = setTimeout(() => {
      api.get('/admin/users', { params: { q: query.trim(), role: 'student' } })
        .then((res) => !cancelled && setResults(res.data.data))
        .catch(() => !cancelled && setResults([]))
    }, 300)
    return () => { cancelled = true; clearTimeout(id) }
  }, [query, ticket.user])

  const apply = async () => {
    if (!account) return
    const ok = await confirm({
      title: 'Ganti email akun ini?',
      description: `Email ${account.name} akan diganti ke ${ticket.contact_email}, semua sesi login lamanya dicabut, dan tautan verifikasi dikirim ke email baru. Tindakan ini dicatat di Log.`,
      confirmLabel: 'Ganti email',
      tone: 'danger',
    })
    if (!ok) return
    setSaving(true)
    try {
      const { data } = await api.post(`/admin/helpdesk/${ticket.id}/change-email`, { user_id: account.id, verified })
      toast.success('Email akun diperbarui. Tautan verifikasi dikirim.')
      onDone(data)
    } catch (err) {
      const f = fieldErrors(err)
      setError(f.verified ?? f.user_id ?? errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="recovery-title" className="flex flex-col gap-3 rounded-xl border border-sand bg-sand-soft p-4">
      <h3 id="recovery-title" className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="size-4 text-sand-ink" aria-hidden="true" /> Pulihkan akses akun</h3>
      <ol className="list-decimal space-y-0.5 pl-5 text-sm text-ink-2">
        <li>Cocokkan data pelapor dengan akun yang ada.</li>
        <li>Verifikasi kepemilikan di luar aplikasi{minor ? ' (pelapor SD atau SMP: lewat orang tua, wali, atau sekolah)' : ''}.</li>
        <li>Ganti email akun ke alamat kontak pelapor.</li>
      </ol>

      {ticket.user ? (
        <AccountCard account={ticket.user}>
          <p className="mt-1 text-xs text-ink-2">Akun ini sudah terhubung ke laporan.</p>
        </AccountCard>
      ) : picked ? (
        <AccountCard account={picked}>
          <button type="button" onClick={() => { setPicked(null); setVerified(false) }} className="mt-1 text-xs font-semibold text-accent underline-offset-4 hover:underline">Pilih akun lain</button>
        </AccountCard>
      ) : (
        <div className="flex flex-col gap-2">
          <Input label="Cari akun Student" type="search" value={query} onChange={(e) => { setQuery(e.target.value); if (e.target.value.trim().length < 2) setResults(null) }} hint="Ketik nama atau perkiraan email lama." />
          {results && (results.length === 0
            ? <p className="text-sm text-ink-2">Tidak ada akun yang cocok.</p>
            : (
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface" aria-label="Hasil pencarian akun">
                {results.slice(0, 6).map((u) => (
                  <li key={u.id}>
                    <button type="button" onClick={() => setPicked(u)} className="flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-hover">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-xs text-ink-2">{u.email} · {educationLabel[u.education_level] ?? '-'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      )}

      {account && (
        <div className="flex flex-col gap-3 border-t border-sand pt-3">
          <p className="text-sm">Email akun akan diganti ke <strong className="break-all">{ticket.contact_email}</strong>.</p>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input type="checkbox" checked={verified} onChange={(e) => { setVerified(e.target.checked); setError('') }} className="mt-0.5 size-4 rounded accent-forest" />
            Saya sudah memverifikasi bahwa pelapor adalah pemilik akun ini.
          </label>
          {error && <p role="alert" className="text-[0.8125rem] font-medium text-danger">{error}</p>}
          <Button variant="danger" className="self-start" disabled={!verified} loading={saving} onClick={apply}>Ganti email akun</Button>
        </div>
      )}
    </section>
  )
}
