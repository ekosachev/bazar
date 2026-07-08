import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-brand text-content hover:bg-brand-hover shadow-sm',
  secondary:
    'bg-bg-hover text-content-secondary hover:text-content border border-border',
  ghost:
    'bg-transparent text-content-secondary hover:bg-bg-hover hover:text-content',
  danger:
    'bg-transparent text-danger hover:bg-danger/10',
} as const

const sizes = {
  sm: 'h-8 px-3 text-caption rounded-sm',
  md: 'h-10 px-4 text-body rounded-md',
  lg: 'h-11 px-5 text-body-lg rounded-md',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'disabled:pointer-events-none disabled:opacity-45',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
