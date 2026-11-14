import { cn } from '@/lib/cn'

// Tabel desktop; di layar kecil tiap baris tampil sebagai daftar bertumpuk (label di kiri, nilai di kanan).
export default function DataTable({ caption, columns, rows, rowKey = 'id', empty }) {
  if (rows.length === 0) {
    return <div className="rounded-panel border border-line bg-surface px-4 py-10 text-center text-sm text-ink-2">{empty ?? 'Tidak ada data.'}</div>
  }

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="hidden border-b border-line bg-canvas/70 md:table-header-group">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('px-4 py-3 text-xs font-medium text-ink-2', c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row[rowKey]} className="block px-4 py-3 transition-colors hover:bg-canvas/60 md:table-row md:p-0">
              {columns.map((c) => (
                <td key={c.key} className={cn('flex items-center justify-between gap-4 py-1 md:table-cell md:px-4 md:py-3 md:align-middle', c.className)}>
                  <span className="text-xs text-ink-2 md:hidden">{c.label}</span>
                  <span className="min-w-0 text-right md:text-left">{c.render ? c.render(row) : row[c.key]}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
