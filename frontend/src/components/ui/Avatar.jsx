import { useState } from 'react'
import { cn } from '@/lib/cn'

const sizes = {
  xs: 'size-7 text-[0.6875rem]',
  sm: 'size-9 text-sm',
  md: 'size-11 text-base',
  lg: 'size-16 text-xl',
  xl: 'size-24 text-3xl',
}

const initials = (name = '') =>
  name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?'

// Foto profil bila ada; bila tidak, monogram bernuansa sage sebagai avatar bawaan.
export default function Avatar({ name, src, size = 'md', className }) {
  const [failed, setFailed] = useState(null)
  const showImage = src && failed !== src

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-sage font-display font-medium text-forest ring-1 ring-forest/10',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img src={src} alt={name ? `Foto profil ${name}` : ''} onError={() => setFailed(src)} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  )
}
