import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Move, Plus, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

const VIEW = 280 // ukuran kotak potong di layar (px)
const OUTPUT = 512 // ukuran hasil foto (px)
const MAX_ZOOM = 4

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Pemotong foto profil: geser untuk mengatur posisi, perbesar lewat slider / scroll / pinch.
 * Hasilnya JPEG persegi 512x512; tampilan bulat hanya panduan karena avatar ditampilkan bulat.
 */
export default function AvatarCropper({ file, onCancel, onConfirm }) {
  const src = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (src) URL.revokeObjectURL(src) }, [src])

  return (
    <Modal open={Boolean(file)} onClose={onCancel} title="Atur foto profil" description="Geser foto dan atur zoom sampai pas di lingkaran." size="sm">
      {src && <CropArea key={src} src={src} onCancel={onCancel} onConfirm={onConfirm} />}
    </Modal>
  )
}

function CropArea({ src, onCancel, onConfirm }) {
  const imgRef = useRef(null)
  const drag = useRef(null)
  const pointers = useRef(new Map())
  const [natural, setNatural] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)

  const base = natural ? VIEW / Math.min(natural.w, natural.h) : 1
  const scale = base * zoom
  const dispW = natural ? natural.w * scale : VIEW
  const dispH = natural ? natural.h * scale : VIEW

  const limit = (o, w = dispW, h = dispH) => ({
    x: clamp(o.x, -(w - VIEW) / 2, (w - VIEW) / 2),
    y: clamp(o.y, -(h - VIEW) / 2, (h - VIEW) / 2),
  })

  const applyZoom = (next) => {
    const z = clamp(next, 1, MAX_ZOOM)
    if (!natural) return setZoom(z)
    const ratio = z / zoom
    const w = natural.w * base * z
    const h = natural.h * base * z
    setOffset((o) => limit({ x: o.x * ratio, y: o.y * ratio }, w, h))
    setZoom(z)
    return undefined
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    drag.current = { x: e.clientX, y: e.clientY, start: offset, pinch: null }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      drag.current.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
    }
  }

  const onPointerMove = (e) => {
    if (!drag.current || !pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && drag.current.pinch) {
      const [a, b] = [...pointers.current.values()]
      applyZoom(drag.current.pinch.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / drag.current.pinch.dist))
      return
    }
    const { x, y, start } = drag.current
    setOffset(limit({ x: start.x + e.clientX - x, y: start.y + e.clientY - y }))
  }

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId)
    drag.current = pointers.current.size ? { ...[...pointers.current.values()][0], start: offset, pinch: null } : null
  }

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 20 : 6
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
    if (moves[e.key]) {
      e.preventDefault()
      setOffset((o) => limit({ x: o.x + moves[e.key][0], y: o.y + moves[e.key][1] }))
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault()
      applyZoom(zoom + 0.1)
    } else if (e.key === '-') {
      e.preventDefault()
      applyZoom(zoom - 0.1)
    }
  }

  // Scroll untuk zoom; listener non-pasif agar halaman tidak ikut bergulir.
  const areaRef = useRef(null)
  const wheelRef = useRef(null)
  useEffect(() => { wheelRef.current = (dy) => applyZoom(zoom * (dy < 0 ? 1.08 : 1 / 1.08)) })
  useEffect(() => {
    const el = areaRef.current
    if (!el) return undefined
    const handler = (e) => {
      e.preventDefault()
      wheelRef.current?.(e.deltaY)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }) }

  const confirm = async () => {
    if (!natural || !imgRef.current) return
    setSaving(true)
    const size = VIEW / scale
    const cx = natural.w / 2 - offset.x / scale
    const cy = natural.h / 2 - offset.y / scale
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, OUTPUT, OUTPUT)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(imgRef.current, cx - size / 2, cy - size / 2, size, size, 0, 0, OUTPUT, OUTPUT)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    setSaving(false)
    if (blob) onConfirm(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={areaRef}
        role="application"
        aria-label="Area potong foto. Seret atau pakai tombol panah untuk menggeser, plus dan minus untuk zoom."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-[#20241f] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:cursor-grabbing"
        style={{ width: VIEW, height: VIEW }}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
          style={{ width: dispW, height: dispH, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`, opacity: natural ? 1 : 0 }}
        />
        {/* Panduan lingkaran: area di luar lingkaran digelapkan. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgb(32_36_31/0.55)]" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[0.6875rem] text-white">
          <Move className="size-3" /> Geser
        </span>
      </div>

      <div className="flex w-full items-center gap-3">
        <button type="button" onClick={() => applyZoom(zoom - 0.2)} aria-label="Perkecil" className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-ink/5 active:scale-95">
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => applyZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="h-1.5 flex-1 cursor-pointer accent-[var(--color-forest)]"
        />
        <button type="button" onClick={() => applyZoom(zoom + 0.2)} aria-label="Perbesar" className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-ink/5 active:scale-95">
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex w-full flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:items-center">
        <Button variant="ghost" size="sm" onClick={reset} className="sm:mr-auto"><RotateCcw aria-hidden="true" /> Atur ulang</Button>
        <Button variant="secondary" onClick={onCancel}>Batal</Button>
        <Button onClick={confirm} loading={saving} disabled={!natural}>Pakai foto</Button>
      </div>
    </div>
  )
}
