import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-bg-subtle px-3.5',
          'text-body-lg text-content placeholder:text-content-faint',
          'transition-colors hover:border-border-strong',
          'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          'disabled:cursor-not-allowed disabled:opacity-45',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
