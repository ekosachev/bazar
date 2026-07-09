import { useEffect } from 'react'
import { IconButton, SearchIcon } from '@/components/ui'
import { mockMessages } from '@/features/chats/data/mock-chats'
import { MessageComposer } from '@/features/messages/components/message-composer'
import { MessageList } from '@/features/messages/components/message-list'
import { useSendMessage } from '@/features/messages/hooks/use-send-message'
import {
  useActiveChatMessages,
  useMessagesStore,
} from '@/features/messages/store/messages-store'

const ACTIVE_CHAT_ID = '1'

export function ChatArea() {
  const setActiveChatId = useMessagesStore((state) => state.setActiveChatId)
  const setMessages = useMessagesStore((state) => state.setMessages)
  const messages = useActiveChatMessages()
  const { sendMessage } = useSendMessage(ACTIVE_CHAT_ID)

  useEffect(() => {
    setActiveChatId(ACTIVE_CHAT_ID)

    const existingMessages = useMessagesStore.getState().getMessages(ACTIVE_CHAT_ID)
    if (existingMessages.length === 0) {
      setMessages(ACTIVE_CHAT_ID, mockMessages)
    }
  }, [setActiveChatId, setMessages])

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-title text-content">Базар «Малина»</h2>
          <p className="text-caption text-content-faint">4 участника</p>
        </div>
        <IconButton label="Поиск по сообщениям">
          <SearchIcon />
        </IconButton>
      </header>

      <MessageList messages={messages} showSender />

      <footer className="border-t border-border px-5 py-4">
        <MessageComposer onSubmit={sendMessage} />
      </footer>
    </section>
  )
}
