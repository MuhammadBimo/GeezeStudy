import { useId } from 'react'
import Field from '@/components/ui/Field'
import { describedBy, fieldClass } from '@/lib/field'
import { cn } from '@/lib/cn'

export default function Textarea({ label, error, hint, className, required, rows = 3, ...props }) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(fieldClass, 'h-auto min-h-24 resize-y py-2.5 leading-relaxed')}
        {...props}
      />
    </Field>
  )
}
