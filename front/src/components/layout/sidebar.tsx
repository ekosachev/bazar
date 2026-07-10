import { useMemo, useState } from 'react'
import { Input } from '@/components/ui'
import { Logo } from '@/components/layout/logo'
import { LogoutButton } from '@/features/auth/components/logout-button'
import { ChatListItem } from '@/features/chats/components/chat-list-item'
import { CreateChatMenu } from '@/features/chats/components/create-chat-menu'
import { ParticipantsPanel } from '@/features/chats/components/participants-panel'
import { sortChatsByActivity } from '@/features/chats/lib/sort-chats'
import { useChatsStore } from '@/features/chats/store/chats-store'

export function Sidebar() {
  const chats = useChatsStore((state) => state.chats)
  const activeChatId = useChatsStore((state) => state.activeChatId)
  const setActiveChatId = useChatsStore((state) => state.setActiveChatId)
  const sortedChats = useMemo(() => sortChatsByActivity(chats), [chats])

  const [participantsChatId, setParticipantsChatId] = useState<string | null>(null)

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-r border-border bg-bg-elevated">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <Logo />
        {/* TODO: временно для проверки логаута, убрать перед коммитом */}
        <LogoutButton size="sm" />
        <CreateChatMenu />
      </header>

      <div className="px-4 py-3">
        <Input placeholder="Поиск чатов" aria-label="Поиск чатов" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3" aria-label="Список чатов">
        {sortedChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            active={chat.id === activeChatId}
            onSelect={setActiveChatId}
            onOpenParticipants={setParticipantsChatId}
          />
        ))}
      </nav>

      <ParticipantsPanel chatId={participantsChatId} onClose={() => setParticipantsChatId(null)} />
    </aside>
  )
}
