import { useId } from 'react'
import { fieldClass } from '@/components/ui/Input'

export default function Select({ label, options, className, ...props }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <select id={id} className={fieldClass} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
