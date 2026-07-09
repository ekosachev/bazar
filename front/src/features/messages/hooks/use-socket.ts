import { useSocketContext } from '@/features/messages/providers/socket-provider'

export function useSocket() {
  const context = useSocketContext()

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }

  return context
}
