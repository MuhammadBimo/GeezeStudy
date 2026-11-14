import { Link } from 'react-router-dom'
import { Flame, GraduationCap, Timer } from 'lucide-react'
import Ornament from '@/components/ui/Ornament'

// Cuplikan tampilan aplikasi yang sebenarnya (bukan ilustrasi), supaya pengunjung tahu apa yang akan dipakai.
function Glimpse() {
  return (
    <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 text-ink shadow-soft-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Hari ini</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-[#5b4a2a]">
          <Flame className="size-3.5" aria-hidden="true" /> 6 hari
        </span>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {[
          ['Laporan praktikum gerak lurus', 'Besok, 23.59', true],
          ['PR teorema Pythagoras', 'Hari ini', false],
          ['Kuis Informatika di LMS', 'Jumat', false],
        ].map(([t, d, done]) => (
          <li key={t} className="flex items-center gap-3">
            <span className={`grid size-4.5 shrink-0 place-items-center rounded-full border ${done ? 'border-forest bg-forest' : 'border-line-strong'}`} />
            <span className={`flex-1 truncate ${done ? 'text-muted line-through' : ''}`}>{t}</span>
            <span className="text-xs text-ink-2">{d}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas p-3">
        <Timer className="size-4 text-forest" aria-hidden="true" />
        <div className="flex-1">
          <div className="flex justify-between text-xs"><span className="font-medium">Target belajar</span><span className="tabular-nums text-ink-2">35/45 menit</span></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]"><div className="h-full w-[78%] rounded-full bg-forest" /></div>
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Link to="/masuk" className="flex items-center gap-2.5 self-start rounded-lg">
          <span className="grid size-8 place-items-center rounded-[0.6rem] bg-forest text-sand">
            <GraduationCap className="size-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-[1.15rem] font-medium tracking-tight">GeezeStudy</span>
        </Link>

        <div className="mx-auto flex w-full max-w-[25rem] flex-1 flex-col justify-center py-10">
          <h1 className="text-[2rem] sm:text-[2.375rem]">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-8 text-center text-sm text-ink-2">{footer}</p>}
        </div>

        <p className="text-center text-xs text-muted lg:text-left">Pendamping produktivitas akademik untuk pelajar dan mahasiswa.</p>
      </main>

      <aside className="dot-pattern relative hidden overflow-hidden bg-forest p-14 text-surface lg:flex lg:flex-col lg:justify-center lg:gap-14">
        <Ornament className="pointer-events-none absolute -right-28 -top-28 size-[30rem] text-forest-mid" />
        <div className="relative max-w-md">
          <h2 className="font-display text-[2.75rem] font-normal leading-[1.08] tracking-tight">Tugas, jadwal, dan target belajar di satu tempat yang tenang.</h2>
          <p className="mt-4 text-surface/75">Catat tugas dari LMS, fokus dengan timer, dan lihat kemajuanmu tumbuh setiap hari.</p>
        </div>
        <div className="relative"><Glimpse /></div>
      </aside>
    </div>
  )
}
