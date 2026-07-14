import { useEffect, useState } from 'react'
import { IconButton, SearchIcon } from '@/components/ui'
import { ParticipantsPanel } from '@/features/chats/components/participants-panel'
import { PeopleIcon } from '@/features/chats/components/people-icon'
import { getChatSubtitle } from '@/features/chats/lib/chat-meta'
import { useChatsStore } from '@/features/chats/store/chats-store'
import { ConnectionStatus } from '@/features/messages/components/connection-status'
import { MessageComposer } from '@/features/messages/components/message-composer'
import { MessageList } from '@/features/messages/components/message-list'
import { MessageSearch } from '@/features/messages/components/message-search'
import { useMarkAsRead } from '@/features/messages/hooks/use-mark-as-read'
import { useMessageActions } from '@/features/messages/hooks/use-message-actions'
import { useMessageEvents } from '@/features/messages/hooks/use-message-events'
import { useMessagePagination } from '@/features/messages/hooks/use-message-pagination'
import { useMessageSearch } from '@/features/messages/hooks/use-message-search'
import { useSendMessage } from '@/features/messages/hooks/use-send-message'
import {
  useActiveChatMessages,
  useMessagesStore,
} from '@/features/messages/store/messages-store'

export function ChatArea() {
  const activeChatId = useChatsStore((state) => state.activeChatId)
  const activeChat = useChatsStore((state) =>
    state.chats.find((chat) => chat.id === activeChatId),
  )

  const setMessagesActiveChatId = useMessagesStore((state) => state.setActiveChatId)
  const messages = useActiveChatMessages()
  const { sendMessage } = useSendMessage(activeChatId ?? '')
  const {
    editMessage,
    deleteMessage,
    pendingMessageId,
    error: actionError,
  } = useMessageActions(activeChatId ?? '')
  useMessageEvents(activeChatId ?? '')
  useMarkAsRead(activeChatId, messages)
  const { containerRef, handleScroll, isLoadingMore, isLoadingInitial } =
    useMessagePagination(activeChatId)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)

  const trimmedSearchQuery = searchQuery.trim()
  const {
    matches,
    activeMatchId,
    scrollToMessage,
    isSearching,
    error: searchError,
  } = useMessageSearch(activeChatId, searchQuery)

  useEffect(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }, [activeChatId])

  useEffect(() => {
    setMessagesActiveChatId(activeChatId ?? null)
  }, [activeChatId, setMessagesActiveChatId])

  if (!activeChat) {
    return (
      <section className="flex h-full min-w-0 flex-1 flex-col items-center justify-center bg-bg px-6">
        <p className="text-body text-content-muted">Выберите чат из списка</p>
      </section>
    )
  }

  const showSender = activeChat.type === 'group'

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-title text-content">{activeChat.title}</h2>
          <div className="flex items-center gap-2 text-caption text-content-faint">
            <span>{getChatSubtitle(activeChat)}</span>
            <span aria-hidden>·</span>
            <ConnectionStatus />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {activeChat.type === 'group' ? (
            <IconButton label="Участники базара" onClick={() => setIsParticipantsOpen(true)}>
              <PeopleIcon />
            </IconButton>
          ) : null}
          <IconButton
            label="Поиск по сообщениям"
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            <SearchIcon />
          </IconButton>
        </div>
      </header>

      <MessageSearch
        open={isSearchOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        matches={matches}
        activeMatchId={activeMatchId}
        onSelectMatch={scrollToMessage}
        isSearching={isSearching}
        error={searchError}
        onClose={() => {
          setIsSearchOpen(false)
          setSearchQuery('')
        }}
      />

      <MessageList
        messages={messages}
        showSender={showSender}
        containerRef={containerRef}
        onScroll={handleScroll}
        isLoadingMore={isLoadingMore}
        highlightQuery={trimmedSearchQuery || undefined}
        activeMatchId={activeMatchId}
        pendingMessageId={pendingMessageId}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
        emptyText={isLoadingInitial ? 'Загрузка…' : 'Сообщений пока нет'}
      />

      <footer className="border-t border-border px-5 py-4">
        {actionError ? <p className="mb-2 text-caption text-danger">{actionError}</p> : null}
        <MessageComposer onSubmit={sendMessage} disabled={!activeChatId} />
      </footer>

      <ParticipantsPanel
        chatId={isParticipantsOpen ? activeChat.id : null}
        onClose={() => setIsParticipantsOpen(false)}
      />
    </section>
  )
}
