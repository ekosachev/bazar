import { Avatar } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { User } from '@/types/chat'

interface UserSelectListProps {
  users: User[]
  selectedIds: string[]
  onToggle: (userId: string) => void
}

export function UserSelectList({ users, selectedIds, onToggle }: UserSelectListProps) {
  return (
    <ul className="max-h-56 space-y-0.5 overflow-y-auto">
      {users.map((user) => {
        const checked = selectedIds.includes(user.id)

        return (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onToggle(user.id)}
              aria-pressed={checked}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                checked ? 'bg-bg-hover' : 'hover:bg-bg-hover/70',
              )}
            >
              <Avatar name={user.displayName} size="sm" />
              <span className="min-w-0 flex-1 truncate text-body text-content">
                {user.displayName}
              </span>
              <span
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-full border',
                  checked
                    ? 'border-brand bg-brand text-content'
                    : 'border-border-strong text-transparent',
                )}
                aria-hidden
              >
                <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
