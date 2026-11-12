import { cn } from '@/lib/cn'

// Tabel responsif: menggulir di dalam wadahnya sendiri, halaman tidak melebar.
export default function DataTable({ caption, columns, rows, rowKey = 'id', empty }) {
  return (
    <div className="overflow-x-auto rounded-brutal border-2 border-ink bg-surface shadow-brutal-sm">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b-2 border-ink bg-yellow">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('px-4 py-2.5 font-bold', c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink/70">{empty ?? 'Tidak ada data.'}</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-ink/20 last:border-b-0 hover:bg-pink-soft/50">
              {columns.map((c) => (
                <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
