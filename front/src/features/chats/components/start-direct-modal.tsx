import { useState } from 'react'
import { Avatar, Input } from '@/components/ui'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Modal } from '@/features/chats/components/modal'
import {
  USER_SEARCH_MIN_LENGTH,
  useUserSearch,
} from '@/features/chats/hooks/use-user-search'
import { useChatsStore } from '@/features/chats/store/chats-store'
import { cn } from '@/lib/cn'

export interface StartDirectModalProps {
  open: boolean
  onClose: () => void
}

export function StartDirectModal({ open, onClose }: StartDirectModalProps) {
  const openDirectChat = useChatsStore((state) => state.openDirectChat)
  const currentUserId = useAuthStore((state) => state.user?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { users, isSearching, error: searchError } = useUserSearch({
    query: searchQuery,
    enabled: open,
    excludeUserIds: currentUserId ? [currentUserId] : [],
  })

  function handleClose() {
    setSearchQuery('')
    setError(null)
    setPendingUserId(null)
    onClose()
  }

  async function handleSelect(userId: string, displayName: string) {
    if (pendingUserId) return

    setError(null)
    setPendingUserId(userId)
    try {
      await openDirectChat(userId, displayName)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось открыть чат')
      setPendingUserId(null)
    }
  }

  const trimmedQuery = searchQuery.trim()

  return (
    <Modal open={open} onClose={handleClose} title="Написать напрямую">
      <div className="space-y-3">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Поиск по username"
          aria-label="Поиск пользователя"
          autoFocus
        />

        {isSearching ? (
          <p className="text-body text-content-muted">Ищем…</p>
        ) : searchError ? (
          <p className="text-body text-danger">{searchError}</p>
        ) : trimmedQuery.length < USER_SEARCH_MIN_LENGTH ? (
          <p className="text-body text-content-muted">Введите минимум 2 символа</p>
        ) : users.length === 0 ? (
          <p className="text-body text-content-muted">Никого не нашли</p>
        ) : (
          <ul className="max-h-72 space-y-0.5 overflow-y-auto">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => void handleSelect(user.id, user.displayName)}
                  disabled={Boolean(pendingUserId)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                    'hover:bg-bg-hover/70 disabled:pointer-events-none disabled:opacity-45',
                  )}
                >
                  <Avatar name={user.displayName} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-body text-content">
                    {pendingUserId === user.id ? 'Открываем…' : user.displayName}
                  </span>
                  <span className="shrink-0 text-caption text-content-faint">@{user.username}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? <p className="mt-3 text-caption text-danger">{error}</p> : null}
    </Modal>
  )
}
