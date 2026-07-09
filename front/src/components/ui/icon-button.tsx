import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Button, type ButtonProps } from './button'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    Pick<ButtonProps, 'variant'> {
  label: string
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, children, variant = 'ghost', type = 'button', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        aria-label={label}
        className={cn('size-9 shrink-0 p-0', className)}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

IconButton.displayName = 'IconButton'
