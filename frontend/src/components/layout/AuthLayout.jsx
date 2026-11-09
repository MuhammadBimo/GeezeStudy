import { Link } from 'react-router-dom'
import { Flame, GraduationCap, ListChecks, Timer } from 'lucide-react'

const points = [
  { icon: ListChecks, text: 'Catat tugas dari LMS dan atur deadline-nya.', color: 'bg-yellow' },
  { icon: Timer, text: 'Belajar fokus dengan timer dan catat sesinya.', color: 'bg-mint' },
  { icon: Flame, text: 'Jaga streak dan kumpulkan Points dari aktivitas nyata.', color: 'bg-orange' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r-[3px] border-ink bg-pink p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2 self-start">
          <span className="grid size-11 place-items-center rounded-brutal border-2 border-ink bg-surface shadow-brutal-sm">
            <GraduationCap className="size-6" aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-extrabold">GeezeStudy</span>
        </Link>

        <div>
          <h2 className="max-w-md font-display text-5xl font-extrabold leading-[1.05]">
            Belajar jadi lebih teratur, satu hari sekali.
          </h2>
          <ul className="mt-8 flex max-w-md flex-col gap-3">
            {points.map(({ icon: Icon, text, color }) => (
              <li key={text} className="flex items-center gap-3 rounded-brutal border-2 border-ink bg-surface p-3 shadow-brutal-sm">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink ${color}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm font-medium">Pendamping produktivitas akademik untuk pelajar dan mahasiswa.</p>
      </aside>

      <main className="grid place-items-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
            <GraduationCap className="size-6" aria-hidden="true" />
            <span className="font-display text-xl font-extrabold">GeezeStudy</span>
          </Link>
          <h1 className="text-4xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1 text-ink/70">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <p className="mt-6 text-center text-sm">{footer}</p>}
        </div>
      </main>
    </div>
  )
}
