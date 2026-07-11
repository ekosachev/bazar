import { useState } from 'react'
import { Avatar } from '@/components/ui'
import { Modal } from '@/features/chats/components/modal'
import { mockUsers } from '@/features/chats/data/mock-users'
import { useChatsStore } from '@/features/chats/store/chats-store'
import { cn } from '@/lib/cn'

export interface StartDirectModalProps {
  open: boolean
  onClose: () => void
}

export function StartDirectModal({ open, onClose }: StartDirectModalProps) {
  const openDirectChat = useChatsStore((state) => state.openDirectChat)

  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
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

  return (
    <Modal open={open} onClose={handleClose} title="Написать напрямую">
      <ul className="max-h-72 space-y-0.5 overflow-y-auto">
        {mockUsers.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => handleSelect(user.id, user.displayName)}
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
            </button>
          </li>
        ))}
      </ul>

      {error ? <p className="mt-3 text-caption text-danger">{error}</p> : null}
    </Modal>
  )
}
