import { Avatar } from '@/components/ui'
import { Modal } from '@/features/chats/components/modal'
import { resolveUser } from '@/features/chats/lib/resolve-user'
import { useChatsStore } from '@/features/chats/store/chats-store'

export interface ParticipantsPanelProps {
  chatId: string | null
  onClose: () => void
}

export function ParticipantsPanel({ chatId, onClose }: ParticipantsPanelProps) {
  const chat = useChatsStore((state) => state.chats.find((item) => item.id === chatId))

  const participants = (chat?.participantIds ?? [])
    .map((id) => resolveUser(id))
    .filter((user) => user !== undefined)

  return (
    <Modal
      open={Boolean(chatId)}
      onClose={onClose}
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
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
