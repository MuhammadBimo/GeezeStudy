// Angka utama besar, label jelas di atasnya, keterangan kecil di bawah. Dipakai dalam baris statistik bergaris.
export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="p-5">
      <p className="flex items-center gap-2 text-sm text-ink-2">
        {Icon && <Icon className="size-4 text-muted" aria-hidden="true" />}
        {label}
      </p>
      <p className="mt-1 font-display text-[1.875rem] leading-tight tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-2">{hint}</p>}
    </div>
  )
}

// Wadah baris statistik: satu panel dengan garis pemisah, bukan kartu-kartu terpisah.
export function StatRow({ children, label }) {
  return (
    <section aria-label={label} className="grid grid-cols-2 divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-xs lg:grid-cols-4 [&>*]:border-line [&>*:nth-child(odd)]:border-r [&>*:nth-child(-n+2)]:border-b lg:[&>*]:border-b-0 lg:[&>*]:border-r lg:[&>*:last-child]:border-r-0">
      {children}
    </section>
  )
}
