import { cn } from '@/lib/cn'

interface PeopleIconProps {
  className?: string
}

export function PeopleIcon({ className }: PeopleIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn('size-5', className)}>
      <circle cx="7" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 16c.5-3 2.3-4.5 4.5-4.5s4 1.5 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 16c.5-3 2.3-4.5 4.5-4.5s4 1.5 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
