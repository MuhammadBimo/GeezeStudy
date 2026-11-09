import { useId } from 'react'
import { fieldClass } from '@/components/ui/Input'

export default function Textarea({ label, className, ...props }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">{label}</label>
      <textarea id={id} rows={3} className={fieldClass} {...props} />
    </div>
  )
}
