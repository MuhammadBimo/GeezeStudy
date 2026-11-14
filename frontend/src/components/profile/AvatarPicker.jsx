import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import AvatarCropper from '@/components/profile/AvatarCropper'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

// Foto asli boleh besar; yang diunggah adalah hasil potongan 512x512 (biasanya < 100 KB).
const MAX_BYTES = 10 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Pemilih foto profil opsional dengan pratinjau.
 * - mode "deferred" (registrasi): file dikembalikan lewat onChange, diunggah setelah akun dibuat.
 * - mode langsung (pengaturan): onUpload(file) / onRemove() dipanggil seketika.
 */
export default function AvatarPicker({ name, currentUrl, file, onChange, onUpload, onRemove, busy = false }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [raw, setRaw] = useState(null) // foto asli yang sedang dipotong
  // Pratinjau dari file lokal; URL dibersihkan saat file berganti.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!TYPES.includes(f.type)) return setError('Pilih foto JPG, PNG, atau WebP.')
    if (f.size > MAX_BYTES) return setError('Ukuran foto maksimal 10 MB.')
    setError('')
    setRaw(f)
    return undefined
  }

  const useCropped = (cropped) => {
    setRaw(null)
    if (onUpload) onUpload(cropped)
    else onChange?.(cropped)
  }

  const shown = file ? preview : currentUrl
  const hasPhoto = Boolean(file || currentUrl)

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar name={name || 'Kamu'} src={shown} size="lg" />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} loading={busy}>
            <Camera aria-hidden="true" /> {hasPhoto ? 'Ganti foto' : 'Tambah foto'}
          </Button>
          {hasPhoto && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => (onRemove ? onRemove() : onChange?.(null))}>
              <Trash2 aria-hidden="true" /> Hapus
            </Button>
          )}
        </div>
        <AvatarCropper file={raw} onCancel={() => setRaw(null)} onConfirm={useCropped} />
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={pick} />
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">{error}</p>
      ) : (
        <p className="mt-2 text-[0.8125rem] text-ink-2">Opsional. JPG, PNG, atau WebP, maksimal 10 MB. Kamu bisa memotongnya setelah memilih.</p>
      )}
    </div>
  )
}
