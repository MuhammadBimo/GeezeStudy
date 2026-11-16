import { useState } from 'react'
import AttachmentField from '@/components/tasks/AttachmentField'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import TurnstileWidget from '@/components/ui/TurnstileWidget'
import { api, errorMessage, fieldErrors } from '@/lib/api'
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, categories } from '@/lib/helpdesk'
import { educationLevels } from '@/lib/profile'

const TURNSTILE_ENABLED = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)

/**
 * Formulir laporan Helpdesk. Dipakai dua kali: Student yang sudah masuk (identitas dari sesi)
 * dan pengunjung yang belum bisa masuk (`guest`: perlu nama, kategori terbatas, captcha bila aktif).
 */
export default function TicketForm({ guest = false, user, initialCategory, onDone, onCancel }) {
  const [form, setForm] = useState({
    category: initialCategory ?? (guest ? 'login' : 'bug'),
    requester_name: '',
    subject: '',
    description: '',
    contact_email: user?.email ?? '',
    nim: '',
    education_level: '',
    old_email: '',
  })
  const [file, setFile] = useState(null)
  const [token, setToken] = useState('')
  const [captchaReset, setCaptchaReset] = useState(0)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const options = categories.filter((c) => !guest || c.guest).map((c) => ({ value: c.value, label: c.label }))
  const chosen = categories.find((c) => c.value === form.category)
  const recovery = form.category === 'account_recovery'

  const validate = () => {
    const next = {}
    if (guest && !form.requester_name.trim()) next.requester_name = 'Isi nama lengkapmu.'
    if (form.subject.trim().length < 4) next.subject = 'Tulis judul singkat, minimal 4 huruf.'
    if (form.description.trim().length < 10) next.description = 'Ceritakan masalahnya, minimal 10 huruf.'
    if (!/^\S+@\S+\.\S+$/.test(form.contact_email.trim())) next.contact_email = 'Isi email yang bisa dihubungi dengan format yang benar.'
    if (recovery && !form.education_level) next.education_level = 'Pilih jenjang pendidikan.'
    if (guest && TURNSTILE_ENABLED && !token) next.turnstile_token = 'Selesaikan verifikasi captcha terlebih dahulu.'
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const body = new FormData()
    body.append('category', form.category)
    body.append('subject', form.subject.trim())
    body.append('description', form.description.trim())
    body.append('contact_email', form.contact_email.trim())
    if (guest) body.append('requester_name', form.requester_name.trim())
    if (recovery) {
      body.append('education_level', form.education_level)
      if (form.nim.trim()) body.append('nim', form.nim.trim())
      if (form.old_email.trim()) body.append('old_email', form.old_email.trim())
    }
    if (file) body.append('attachment', file)
    if (guest && token) body.append('turnstile_token', token)

    setSending(true)
    try {
      const { data } = await api.post(guest ? '/helpdesk/guest' : '/helpdesk', body)
      onDone(data)
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) })
      setCaptchaReset((k) => k + 1)
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {errors.form && <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">{errors.form}</p>}

      <Select label="Kategori" required options={options} value={form.category} onChange={set('category')} hint={chosen?.hint} error={errors.category} />

      {guest && <Input label="Nama lengkap" required autoComplete="name" value={form.requester_name} onChange={set('requester_name')} error={errors.requester_name} />}

      {recovery && (
        <fieldset className="grid gap-4 rounded-xl bg-canvas p-4 sm:grid-cols-2">
          <legend className="sr-only">Data untuk membantu menemukan akunmu</legend>
          <p className="text-sm text-ink-2 sm:col-span-2">Data ini membantu admin memastikan akun itu milikmu. Jangan tulis password di sini.</p>
          <Select label="Jenjang pendidikan" required options={educationLevels} value={form.education_level} onChange={set('education_level')} placeholder="Pilih jenjang" error={errors.education_level} />
          <Input label="NIM atau nomor induk" value={form.nim} onChange={set('nim')} hint="Jika ada." error={errors.nim} />
          <Input className="sm:col-span-2" label="Perkiraan email lama" type="text" inputMode="email" autoComplete="off" value={form.old_email} onChange={set('old_email')} hint="Jika masih ingat, walau hanya sebagian." error={errors.old_email} />
        </fieldset>
      )}

      <Input label="Judul laporan" required maxLength={140} value={form.subject} onChange={set('subject')} placeholder="mis. Timer berhenti sendiri" error={errors.subject} />
      <Textarea label="Ceritakan masalahnya" required rows={5} maxLength={4000} value={form.description} onChange={set('description')} error={errors.description} hint="Apa yang kamu lakukan, apa yang terjadi, dan apa yang kamu harapkan." />
      <Input
        label={recovery ? 'Email baru yang bisa dihubungi' : 'Email yang bisa dihubungi'}
        required
        type="email"
        autoComplete="email"
        value={form.contact_email}
        onChange={set('contact_email')}
        error={errors.contact_email}
        hint={guest ? 'Balasan admin dikirim ke email ini.' : 'Dipakai bila admin perlu menghubungimu. Balasan juga tampil di halaman Bantuan.'}
      />

      <div>
        <AttachmentField
          label="Screenshot (opsional)"
          accept={ATTACHMENT_ACCEPT}
          maxBytes={ATTACHMENT_MAX_BYTES}
          hint="Gambar atau PDF, maksimal 5 MB. Jangan sertakan password."
          pendingNote="Diunggah saat dikirim"
          file={file}
          onChange={setFile}
          onRemove={() => setFile(null)}
        />
        {errors.attachment && <p role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-danger">{errors.attachment}</p>}
      </div>

      {guest && (
        <TurnstileWidget
          onVerify={(t) => { setToken(t); if (t) setErrors((cur) => ({ ...cur, turnstile_token: undefined })) }}
          resetKey={captchaReset}
          error={errors.turnstile_token}
        />
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={sending}>Batal</Button>}
        <Button type="submit" loading={sending}>{sending ? 'Mengirim...' : 'Kirim laporan'}</Button>
      </div>
    </form>
  )
}
