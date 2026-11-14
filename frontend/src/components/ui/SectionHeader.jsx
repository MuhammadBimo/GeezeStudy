import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

// Judul bagian di dalam halaman, dengan tautan opsional ke halaman lengkapnya.
export default function SectionHeader({ title, to, linkLabel = 'Lihat semua', meta, id }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-base font-semibold">{title}</h2>
      {meta && <span className="text-sm text-ink-2">{meta}</span>}
      {to && (
        <Link to={to} className="group inline-flex items-center gap-0.5 rounded text-sm font-medium text-forest">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-200 group-hover:bg-[length:100%_1px]">{linkLabel}</span>
          <ArrowUpRight className="size-3.5 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
