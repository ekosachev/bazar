import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  neutral: 'bg-surface-muted text-content-secondary',
  unread: 'bg-accent text-content-on-accent',
  subtle: 'bg-bg-hover text-content-muted',
} as const

export interface BadgeProps {
  children: ReactNode
  variant?: keyof typeof variants
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-caption font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
