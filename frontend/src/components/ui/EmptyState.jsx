export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="grid place-items-center gap-2 rounded-brutal border-2 border-dashed border-ink p-6 text-center">
      {Icon && <Icon className="size-8 text-pink" aria-hidden="true" />}
      <p className="font-display text-lg font-bold">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink/70">{description}</p>}
      {action}
    </div>
  )
}
