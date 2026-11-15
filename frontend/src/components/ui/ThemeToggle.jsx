import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

/** Tombol cepat terang/gelap. Pilihan lengkap (termasuk "Otomatis") ada di Pengaturan. */
export default function ThemeToggle({ className }) {
  const { resolved, toggle } = useTheme()
  const dark = resolved === 'dark'
  const Icon = dark ? Sun : Moon
  return (
    <button
      type="button"
      onClick={(e) => {
        // Animasi melebar dari tengah tombol (juga saat ditekan lewat keyboard).
        const r = e.currentTarget.getBoundingClientRect()
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      className={cn('grid size-9 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink active:scale-95', className)}
    >
      <Icon className="size-[1.125rem]" aria-hidden="true" />
    </button>
  )
}
