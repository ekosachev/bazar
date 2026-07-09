import { Button, IconButton, Input, SearchIcon } from '@/components/ui'
import { mockMessages } from '@/features/chats/data/mock-chats'
import { MessageList } from '@/features/messages/components/message-list'

export function ChatArea() {
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

      <MessageList messages={mockMessages} showSender />

      <footer className="border-t border-border px-5 py-4">
        <form
          className="flex items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <Input
            className="flex-1"
            placeholder="Написать сообщение"
            aria-label="Написать сообщение"
          />
          <Button type="submit" variant="primary">
            Газ
          </Button>
        </form>
      </footer>
    </section>
  )
}
