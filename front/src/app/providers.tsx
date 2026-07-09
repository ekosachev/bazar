import type { ReactNode } from 'react'
import { AppRouter } from '@/app/router'

interface AppProvidersProps {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <>{children ?? <AppRouter />}</>
}
