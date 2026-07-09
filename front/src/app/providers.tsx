import type { ReactNode } from 'react'
import { AppRouter } from '@/app/router'
import { SocketProvider } from '@/features/messages/providers/socket-provider'

interface AppProvidersProps {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <SocketProvider>{children ?? <AppRouter />}</SocketProvider>
}
