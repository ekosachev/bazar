import { useSocket } from '@/features/messages/hooks/use-socket'
import type { WsConnectionStatus } from '@/features/messages/types/ws-events'
import { cn } from '@/lib/cn'

const statusLabels: Record<WsConnectionStatus, string> = {
  connected: 'В сети',
  connecting: 'Подключение…',
  reconnecting: 'Переподключение…',
  disconnected: 'Офлайн',
}

export function ConnectionStatus() {
  const { status } = useSocket()

  return (
    <span className="inline-flex items-center gap-1.5 text-caption text-content-faint">
      <span
        className={cn(
          'size-2 rounded-full',
          status === 'connected' && 'bg-success',
          status === 'connecting' && 'bg-content-muted animate-pulse',
          status === 'reconnecting' && 'bg-content-muted animate-pulse',
          status === 'disconnected' && 'bg-content-faint',
        )}
        aria-hidden
      />
      {statusLabels[status]}
    </span>
  )
}
