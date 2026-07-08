import { cn } from '@/lib/cn'

const sizes = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-body',
  lg: 'size-12 text-body-lg',
} as const

export interface AvatarProps {
  name: string
  src?: string
  size?: keyof typeof sizes
  online?: boolean
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ name, src, size = 'md', online, className }: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover bg-surface-muted', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-muted font-medium text-content-secondary',
            sizes[size],
          )}
          aria-hidden
        >
          {getInitials(name)}
        </div>
      )}

      {online ? (
        <span
          className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-bg-elevated"
          aria-label="В сети"
        />
      ) : null}
    </div>
  )
}
