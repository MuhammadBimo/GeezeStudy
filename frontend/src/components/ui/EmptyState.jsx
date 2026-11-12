export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="grid place-items-center gap-2 rounded-panel border border-dashed border-line p-6 text-center">
      {Icon && <Icon className="size-8 text-forest" aria-hidden="true" />}
      <p className="font-display text-lg font-medium">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink/80">{description}</p>}
      {action}
    </div>
  )
}
