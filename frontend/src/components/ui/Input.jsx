import { useId } from 'react'
export const fieldClass =
  'w-full rounded-brutal border-2 border-ink bg-surface px-4 py-2.5 shadow-brutal-sm transition-shadow focus:shadow-brutal motion-reduce:transition-none'

export default function Input({ label, error, hint, className, ...props }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClass}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-sm text-ink/70">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}
