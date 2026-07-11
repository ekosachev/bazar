import { useEffect } from 'react'
import { IconButton, SearchIcon } from '@/components/ui'
import { getChatSubtitle } from '@/features/chats/lib/chat-meta'
import { useChatsStore } from '@/features/chats/store/chats-store'
import { mockMessages } from '@/features/chats/data/mock-chats'
import { ConnectionStatus } from '@/features/messages/components/connection-status'
import { MessageComposer } from '@/features/messages/components/message-composer'
import { MessageList } from '@/features/messages/components/message-list'
import { useMessageEvents } from '@/features/messages/hooks/use-message-events'
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
  const setMessages = useMessagesStore((state) => state.setMessages)
  const messages = useActiveChatMessages()
  const { sendMessage } = useSendMessage(activeChatId ?? '')
  useMessageEvents(activeChatId ?? '')

  useEffect(() => {
    setMessagesActiveChatId(activeChatId ?? null)

    if (!activeChatId) {
      return
    }

    const existingMessages = useMessagesStore.getState().getMessages(activeChatId)
    if (existingMessages.length > 0) {
      return
    }

    if (activeChatId === '1') {
      setMessages(activeChatId, mockMessages)
    }
  }, [activeChatId, setMessages, setMessagesActiveChatId])

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
        <IconButton label="Поиск по сообщениям">
          <SearchIcon />
        </IconButton>
      </header>

      <MessageList messages={messages} showSender={showSender} />

      <footer className="border-t border-border px-5 py-4">
        <MessageComposer onSubmit={sendMessage} disabled={!activeChatId} />
      </footer>
    </section>
  )
}
