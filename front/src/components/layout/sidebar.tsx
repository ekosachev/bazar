import { useMemo, useState } from 'react'
import { IconButton, Input, PlusIcon } from '@/components/ui'
import { Logo } from '@/components/layout/logo'
import { LogoutButton } from '@/features/auth/components/logout-button'
import { ChatListItem } from '@/features/chats/components/chat-list-item'
import { mockChats } from '@/features/chats/data/mock-chats'
import { sortChatsByActivity } from '@/features/chats/lib/sort-chats'

export function Sidebar() {
  const sortedChats = useMemo(() => sortChatsByActivity(mockChats), [])
  const [activeChatId, setActiveChatId] = useState(sortedChats[0]?.id)

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-r border-border bg-bg-elevated">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <Logo />
        {/* TODO: временно для проверки логаута, убрать перед коммитом */}
        <LogoutButton size="sm" />
        <IconButton label="Новый чат">
          <PlusIcon />
        </IconButton>
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
          />
        ))}
      </nav>
    </aside>
  )
}
