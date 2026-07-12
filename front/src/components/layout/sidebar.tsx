import { useEffect, useMemo, useState } from 'react'
import { Avatar, Input } from '@/components/ui'
import { Logo } from '@/components/layout/logo'
import { ProfileModal } from '@/features/auth/components/profile-modal'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ChatListItem } from '@/features/chats/components/chat-list-item'
import { CreateChatMenu } from '@/features/chats/components/create-chat-menu'
import { ParticipantsPanel } from '@/features/chats/components/participants-panel'
import { sortChatsByActivity } from '@/features/chats/lib/sort-chats'
import { useChatsStore } from '@/features/chats/store/chats-store'

export function Sidebar() {
  const chats = useChatsStore((state) => state.chats)
  const activeChatId = useChatsStore((state) => state.activeChatId)
  const setActiveChatId = useChatsStore((state) => state.setActiveChatId)
  const isLoadingChats = useChatsStore((state) => state.isLoadingChats)
  const loadChats = useChatsStore((state) => state.loadChats)
  const sortedChats = useMemo(() => sortChatsByActivity(chats), [chats])
  const [chatSearchQuery, setChatSearchQuery] = useState('')

  const visibleChats = useMemo(() => {
    const query = chatSearchQuery.trim().toLowerCase()
    if (!query) {
      return sortedChats
    }

    return sortedChats.filter((chat) => chat.title.toLowerCase().includes(query))
  }, [chatSearchQuery, sortedChats])

  const [participantsChatId, setParticipantsChatId] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    loadChats()
  }, [loadChats])

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-r border-border bg-bg-elevated">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <Logo />
        <CreateChatMenu />
      </header>

      <div className="px-4 py-3">
        <Input
          placeholder="Поиск чатов"
          aria-label="Поиск чатов"
          value={chatSearchQuery}
          onChange={(event) => setChatSearchQuery(event.target.value)}
        />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3" aria-label="Список чатов">
        {isLoadingChats && visibleChats.length === 0 ? (
          <p className="px-3 py-2 text-body text-content-muted">Загрузка чатов…</p>
        ) : null}

        {!isLoadingChats && chats.length === 0 ? (
          <p className="px-3 py-2 text-body text-content-muted">
            Пока нет чатов — создайте базар, точку или напишите кому-нибудь
          </p>
        ) : null}

        {!isLoadingChats && chats.length > 0 && visibleChats.length === 0 ? (
          <p className="px-3 py-2 text-body text-content-muted">Чаты не найдены</p>
        ) : null}

        {visibleChats.map((chat) => (
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

      {user ? (
        <footer className="border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-hover/70"
          >
            <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />
            <span className="min-w-0 flex-1 truncate text-body text-content">{user.displayName}</span>
          </button>
        </footer>
      ) : null}

      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </aside>
  )
}
