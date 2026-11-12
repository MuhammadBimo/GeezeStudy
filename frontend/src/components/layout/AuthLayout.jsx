import { Flame, GraduationCap, ListChecks, Timer } from 'lucide-react'
import Ornament from '@/components/ui/Ornament'

const points = [
  { icon: ListChecks, text: 'Catat tugas dari LMS dan atur deadline-nya.' },
  { icon: Timer, text: 'Belajar fokus dengan timer, sesinya tercatat.' },
  { icon: Flame, text: 'Jaga streak, kumpulkan Points dari aktivitas nyata.' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="dot-pattern relative hidden flex-col justify-between overflow-hidden bg-forest p-12 text-surface lg:flex">
        <Ornament className="pointer-events-none absolute -bottom-24 -right-24 size-[26rem] text-forest-mid" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-panel bg-surface text-forest">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-medium">GeezeStudy</span>
        </div>

        <div className="relative">
          <h2 className="max-w-md font-display text-5xl font-medium leading-[1.08]">
            Belajar lebih teratur, satu hari sekali.
          </h2>
          <ul className="mt-10 flex max-w-md flex-col gap-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-surface/85">
                <Icon className="size-5 shrink-0 text-sage" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-surface/60">Pendamping produktivitas akademik untuk pelajar dan mahasiswa.</p>
      </aside>

      <main className="grid place-items-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-forest text-surface">
              <GraduationCap className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-medium">GeezeStudy</span>
          </div>
          <h1 className="text-4xl font-medium">{title}</h1>
          {subtitle && <p className="mt-2 text-ink/80">{subtitle}</p>}

          <div className="mt-6">{children}</div>
          {footer && <p className="mt-6 text-center text-sm">{footer}</p>}
        </div>
      </main>
    </div>
  )
}
