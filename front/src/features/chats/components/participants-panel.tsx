import { useState } from 'react'
import { Avatar, Button, IconButton } from '@/components/ui'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Modal } from '@/features/chats/components/modal'
import { mockUsers } from '@/features/chats/data/mock-users'
import { resolveUser } from '@/features/chats/lib/resolve-user'
import { useChatsStore } from '@/features/chats/store/chats-store'

export interface ParticipantsPanelProps {
  chatId: string | null
  onClose: () => void
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ParticipantsPanel({ chatId, onClose }: ParticipantsPanelProps) {
  const chat = useChatsStore((state) => state.chats.find((item) => item.id === chatId))
  const addParticipant = useChatsStore((state) => state.addParticipant)
  const removeParticipant = useChatsStore((state) => state.removeParticipant)
  const currentUserId = useAuthStore((state) => state.user?.id)
  const isAdmin = Boolean(chat && currentUserId && chat.adminIds?.includes(currentUserId))

  const [isAddingOpen, setIsAddingOpen] = useState(false)

  const participantIds = chat?.participantIds ?? []
  const participants = participantIds.map((id) => resolveUser(id)).filter((user) => user !== undefined)
  const candidates = mockUsers.filter((user) => !participantIds.includes(user.id))

  function handleClose() {
    setIsAddingOpen(false)
    onClose()
  }

  return (
    <Modal
      open={Boolean(chatId)}
      onClose={handleClose}
      title={chat ? `Участники «${chat.title}»` : 'Участники'}
    >
      {participants.length === 0 ? (
        <p className="text-body text-content-muted">Пока нет участников</p>
      ) : (
        <ul className="max-h-72 space-y-0.5 overflow-y-auto">
          {participants.map((user) => (
            <li key={user.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar name={user.displayName} size="sm" />
              <span className="min-w-0 flex-1 truncate text-body text-content">
                {user.displayName}
              </span>
              {isAdmin || user.id === currentUserId ? (
                <IconButton
                  label={user.id === currentUserId ? 'Выйти из базара' : `Удалить ${user.displayName}`}
                  variant="danger"
                  onClick={() => {
                    if (!chat) return
                    removeParticipant(chat.id, user.id)
                    if (user.id === currentUserId) handleClose()
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {isAdmin ? (
        <div className="mt-4 border-t border-border pt-4">
          {isAddingOpen ? (
            candidates.length === 0 ? (
              <p className="text-body text-content-muted">Все пользователи уже в базаре</p>
            ) : (
              <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                {candidates.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => chat && addParticipant(chat.id, user.id)}
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
            )
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => setIsAddingOpen(true)}>
              Добавить участника
            </Button>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
