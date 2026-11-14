import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Field from '@/components/ui/Field'
import { describedBy, fieldClass } from '@/lib/field'
import { passwordStrength } from '@/lib/password'
import { cn } from '@/lib/cn'

export default function Input({ label, error, hint, className, required, icon: Icon, labelHidden, ...props }) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className} labelHidden={labelHidden}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />}
        <input
          id={id}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(fieldClass, Icon && 'pl-10')}
          {...props}
        />
      </div>
    </Field>
  )
}

const strengthColor = ['bg-line', 'bg-danger', 'bg-warning', 'bg-success', 'bg-forest']

export function PasswordInput({ label = 'Password', error, hint, className, required, showStrength = false, value, ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const strength = passwordStrength(value)

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(fieldClass, 'pr-12')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 flex items-center gap-3" aria-live="polite">
          <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={cn('h-1 rounded-full transition-colors duration-200', n <= strength.score ? strengthColor[strength.score] : 'bg-line')} />
            ))}
          </div>
          <span className="w-20 text-right text-xs font-medium text-ink-2">Kekuatan: {strength.label}</span>
        </div>
      )}
    </Field>
  )
}
