import type {
  WsClientEvent,
  WsConnectionStatus,
  WsServerEvent,
} from '@/features/messages/types/ws-events'

export interface WsClientOptions {
  url: string
  getAccessToken: () => string | null
  reconnectDelayMs?: number
  maxReconnectDelayMs?: number
}

type StatusListener = (status: WsConnectionStatus) => void
type MessageListener = (event: WsServerEvent) => void

export function getDefaultWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

export class WsClient {
  private socket: WebSocket | null = null
  private status: WsConnectionStatus = 'disconnected'
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempt = 0
  private shouldReconnect = false
  private readonly statusListeners = new Set<StatusListener>()
  private readonly messageListeners = new Set<MessageListener>()
  private readonly options: WsClientOptions

  constructor(options: WsClientOptions) {
    this.options = options
  }

  connect() {
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return
    }

    this.shouldReconnect = true
    this.clearReconnectTimer()
    this.setStatus(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting')

    const url = new URL(this.options.url, window.location.origin)
    const token = this.options.getAccessToken()

    if (token) {
      url.searchParams.set('token', token)
    }

    this.socket = new WebSocket(url.toString())

    this.socket.onopen = () => {
      this.reconnectAttempt = 0
      this.setStatus('connected')
    }

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as WsServerEvent
        this.messageListeners.forEach((listener) => listener(parsed))
      } catch {
        // ignore invalid frames until backend contract is finalized
      }
    }

    this.socket.onclose = () => {
      this.socket = null

      if (this.shouldReconnect) {
        this.scheduleReconnect()
        return
      }

      this.setStatus('disconnected')
    }

    this.socket.onerror = () => {
      this.socket?.close()
    }
  }

  disconnect() {
    this.shouldReconnect = false
    this.clearReconnectTimer()
    this.socket?.close()
    this.socket = null
    this.setStatus('disconnected')
  }

  send(event: WsClientEvent) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return false
    }

    this.socket.send(JSON.stringify(event))
    return true
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener)
    listener(this.status)

    return () => {
      this.statusListeners.delete(listener)
    }
  }

  onMessage(listener: MessageListener) {
    this.messageListeners.add(listener)

    return () => {
      this.messageListeners.delete(listener)
    }
  }

  getStatus() {
    return this.status
  }

  private setStatus(status: WsConnectionStatus) {
    this.status = status
    this.statusListeners.forEach((listener) => listener(status))
  }

  private scheduleReconnect() {
    this.setStatus('reconnecting')

    const baseDelay = this.options.reconnectDelayMs ?? 1000
    const maxDelay = this.options.maxReconnectDelayMs ?? 10000
    const delay = Math.min(baseDelay * 2 ** this.reconnectAttempt, maxDelay)

    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) {
      return
    }

    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }
}

export function createWsClient(options: WsClientOptions) {
  return new WsClient(options)
}

export const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? getDefaultWsUrl()
