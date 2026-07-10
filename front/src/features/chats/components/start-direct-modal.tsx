import { Avatar } from '@/components/ui'
import { Modal } from '@/features/chats/components/modal'
import { mockUsers } from '@/features/chats/data/mock-users'
import { useChatsStore } from '@/features/chats/store/chats-store'

export interface StartDirectModalProps {
  open: boolean
  onClose: () => void
}

export function StartDirectModal({ open, onClose }: StartDirectModalProps) {
  const openDirectChat = useChatsStore((state) => state.openDirectChat)

  function handleSelect(userId: string, displayName: string) {
    openDirectChat(userId, displayName)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Написать напрямую">
      <ul className="max-h-72 space-y-0.5 overflow-y-auto">
        {mockUsers.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => handleSelect(user.id, user.displayName)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-hover/70"
            >
              <Avatar name={user.displayName} size="sm" />
              <span className="min-w-0 flex-1 truncate text-body text-content">
                {user.displayName}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
