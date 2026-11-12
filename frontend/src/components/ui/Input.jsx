import { useId } from 'react'

export const fieldClass =
  'w-full min-h-11 rounded-panel border border-line bg-canvas px-4 py-2.5 shadow-inset placeholder:text-ink/80 transition-[box-shadow,border-color,background-color] duration-150 hover:border-forest/40 focus:border-forest focus:bg-surface focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-60 aria-[invalid=true]:border-danger motion-reduce:transition-none'

export default function Input({ label, error, hint, className, required, ...props }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={fieldClass}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-ink/80">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}
