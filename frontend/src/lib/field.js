import { cn } from '@/lib/cn'

// id elemen petunjuk/galat yang dibacakan pembaca layar untuk sebuah kontrol form.
export const describedBy = (id, hint, error) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

// Kelas dasar semua kontrol berbentuk kotak isian (dipakai juga oleh Select, DatePicker).
export const fieldClass = cn(
  'flex h-11 w-full items-center rounded-control border border-line-strong bg-surface px-3.5 text-[0.9375rem] text-ink shadow-inset',
  'transition-[border-color,box-shadow,background-color] duration-150',
  'hover:border-[#bdb9ab] focus:border-forest focus:outline-none focus:ring-3 focus:ring-forest/15',
  'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15',
)
