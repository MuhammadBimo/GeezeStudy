import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Menggabungkan class Tailwind tanpa konflik (class terakhir menang).
export const cn = (...inputs) => twMerge(clsx(inputs))
