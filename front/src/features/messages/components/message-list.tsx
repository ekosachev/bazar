import { MessageBubble } from '@/features/messages/components/message-bubble'
import { useAutoScroll } from '@/features/messages/hooks/use-auto-scroll'
import type { Message } from '@/types/chat'

export interface MessageListProps {
  messages: Message[]
  showSender?: boolean
}

export function MessageList({ messages, showSender = false }: MessageListProps) {
  const containerRef = useAutoScroll(messages)

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-4">
        <p className="text-body text-content-faint">Сообщений пока нет</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} showSender={showSender} />
      ))}
    </div>
  )
}
