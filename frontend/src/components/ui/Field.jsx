import { AlertCircle } from 'lucide-react'

// Kerangka label + petunjuk + galat yang dipakai semua kontrol form.
export default function Field({ id, label, hint, error, required, className, children, labelHidden = false }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={labelHidden ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-ink'}>
          {label}
          {required && <span className="text-muted" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] text-ink-2">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] font-medium text-danger">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  )
}
