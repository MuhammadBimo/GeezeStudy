import { cn } from '@/lib/cn'

const variants = {
  primary: 'bg-pink text-ink',
  secondary: 'bg-yellow text-ink',
  neutral: 'bg-surface text-ink',
  danger: 'bg-danger text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
}

export default function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-brutal border-2 border-ink font-bold shadow-brutal',
        'transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg',
        'active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:pointer-events-none disabled:opacity-50',
        'motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
