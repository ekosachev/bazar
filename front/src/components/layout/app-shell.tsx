import { ChatArea } from '@/components/layout/chat-area'
import { Sidebar } from '@/components/layout/sidebar'

export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  )
}
