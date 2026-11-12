import { useId } from 'react'

export const fieldClass =
  'w-full rounded-brutal border-2 border-ink bg-surface px-4 py-2.5 shadow-brutal-sm transition-shadow focus:shadow-brutal motion-reduce:transition-none'

export default function Input({ label, error, hint, className, required, ...props }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">
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
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-ink/70">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}
