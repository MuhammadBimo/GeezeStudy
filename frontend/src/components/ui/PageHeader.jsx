// Judul halaman: serif besar untuk karakter editorial, aksi di kanan (turun ke bawah di mobile).
export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <header className="mb-7 sm:mb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[1.875rem] sm:text-[2.25rem]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-xl text-ink-2">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  )
}
