import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type {
  WsClientEvent,
  WsConnectionStatus,
  WsServerEvent,
} from '@/features/messages/types/ws-events'
import { createWsClient, WS_URL, type WsClient } from '@/lib/ws-client'

interface SocketContextValue {
  status: WsConnectionStatus
  send: (event: WsClientEvent) => boolean
  subscribe: (listener: (event: WsServerEvent) => void) => () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const clientRef = useRef<WsClient | null>(null)
  const [status, setStatus] = useState<WsConnectionStatus>('disconnected')

  useEffect(() => {
    if (!accessToken) {
      clientRef.current?.disconnect()
      clientRef.current = null
      setStatus('disconnected')
      return
    }

    const client = createWsClient({
      url: WS_URL,
      getAccessToken: () => useAuthStore.getState().accessToken,
    })

    clientRef.current = client
    const unsubscribeStatus = client.onStatusChange(setStatus)
    client.connect()

    return () => {
      unsubscribeStatus()
      client.disconnect()
      clientRef.current = null
    }
  }, [accessToken])

  const send = useCallback((event: WsClientEvent) => {
    return clientRef.current?.send(event) ?? false
  }, [])

  const subscribe = useCallback((listener: (event: WsServerEvent) => void) => {
    const client = clientRef.current
    if (!client) {
      return () => {}
    }

    return client.onMessage(listener)
    // Re-create when `status` changes so consumers that never change their own
    // deps (e.g. a global tracker mounted once) still re-subscribe once the
    // client actually connects, instead of forever holding a stale no-op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, status])

  const value = useMemo(
    () => ({
      status,
      send,
      subscribe,
    }),
    [send, status, subscribe],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocketContext() {
  return useContext(SocketContext)
}
