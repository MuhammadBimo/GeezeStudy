export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink/70">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
