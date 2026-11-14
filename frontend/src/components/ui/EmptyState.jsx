import { cn } from '@/lib/cn'

// Ilustrasi garis minimalis per konteks. Dekoratif, jadi disembunyikan dari pembaca layar.
const art = {
  tasks: (
    <>
      <rect x="22" y="14" width="52" height="66" rx="8" className="fill-sage" />
      <rect x="22" y="14" width="52" height="66" rx="8" />
      <path d="M38 14v-3a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v3" />
      <path d="m33 38 5 5 9-10M55 39h10M33 58h32M33 68h22" />
    </>
  ),
  calendar: (
    <>
      <rect x="16" y="20" width="64" height="58" rx="9" className="fill-sand-soft" />
      <rect x="16" y="20" width="64" height="58" rx="9" />
      <path d="M16 36h64M34 13v14M62 13v14" />
      <circle cx="48" cy="56" r="7" className="fill-sage" />
    </>
  ),
  inbox: (
    <>
      <path d="M26 58c0-16 7-30 22-30s22 14 22 30l5 8H21Z" className="fill-sage" />
      <path d="M26 58c0-16 7-30 22-30s22 14 22 30l5 8H21Z" />
      <path d="M42 74a6 6 0 0 0 12 0M48 20v8" />
    </>
  ),
  trophy: (
    <>
      <path d="M32 18h32v18a16 16 0 0 1-32 0Z" className="fill-sand-soft" />
      <path d="M32 18h32v18a16 16 0 0 1-32 0Z" />
      <path d="M32 24H22a10 10 0 0 0 12 14M64 24h10a10 10 0 0 1-12 14M48 52v12M36 76h24M40 64h16v12H40z" />
    </>
  ),
  target: (
    <>
      <circle cx="48" cy="48" r="30" className="fill-sage" />
      <circle cx="48" cy="48" r="30" />
      <circle cx="48" cy="48" r="18" />
      <circle cx="48" cy="48" r="6" className="fill-forest" />
      <path d="m48 48 22-22M64 24h6v6" />
    </>
  ),
  people: (
    <>
      <circle cx="38" cy="36" r="11" className="fill-sage" />
      <circle cx="38" cy="36" r="11" />
      <path d="M18 76c2-14 10-21 20-21s18 7 20 21" />
      <circle cx="63" cy="40" r="8" />
      <path d="M58 58c2-1 3-1 5-1 8 0 14 6 16 17" />
    </>
  ),
  search: (
    <>
      <circle cx="42" cy="42" r="20" className="fill-sand-soft" />
      <circle cx="42" cy="42" r="20" />
      <path d="m57 57 17 17M34 42h16" />
    </>
  ),
  error: (
    <>
      <circle cx="48" cy="48" r="30" className="fill-danger-soft" />
      <circle cx="48" cy="48" r="30" />
      <path d="M48 34v18M48 60v2" />
    </>
  ),
}

export default function EmptyState({ illustration = 'tasks', icon: Icon, title, description, action, compact = false, className }) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12', className)}>
      {compact && Icon ? (
        <span className="grid size-10 place-items-center rounded-full bg-sage text-forest"><Icon className="size-5" aria-hidden="true" /></span>
      ) : (
        <svg viewBox="0 0 96 96" aria-hidden="true" className={cn('fill-none stroke-forest/70', compact ? 'size-16' : 'size-24')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {art[illustration] ?? art.tasks}
        </svg>
      )}
      <p className={cn('font-semibold text-ink', compact ? 'text-sm' : 'text-base')}>{title}</p>
      {description && <p className="max-w-xs text-sm text-ink-2">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
