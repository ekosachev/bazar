import type {
  WsClientEvent,
  WsConnectionStatus,
  WsServerEvent,
} from '@/features/messages/types/ws-events'
import type { Message } from '@/types/chat'

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

interface WireMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  reply_to_id?: string | null
  created_at: string
  updated_at: string
}

interface WireServerEvent {
  type?: string
  code?: string
  description?: string
  payload?: {
    message?: WireMessage
    client_message_id?: string
    chat_id?: string
    user_id?: string
    message_id?: string
  }
}

function fromWireMessage(wire: WireMessage): Message {
  return {
    id: wire.id,
    chatId: wire.chat_id,
    senderId: wire.sender_id,
    content: wire.content,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
    replyToId: wire.reply_to_id ?? undefined,
  }
}

function parseServerEvent(raw: WireServerEvent): WsServerEvent | null {
  if (raw.type === 'error') {
    return {
      type: 'error',
      code: raw.code ?? 'unknown',
      description: raw.description ?? 'Unknown error',
    }
  }

  if (raw.type === 'message:new' && raw.payload?.message) {
    return {
      type: 'message:new',
      payload: { message: fromWireMessage(raw.payload.message) },
    }
  }

  if (raw.type === 'message:sent' && raw.payload?.message && raw.payload.client_message_id) {
    return {
      type: 'message:sent',
      payload: {
        clientMessageId: raw.payload.client_message_id,
        message: fromWireMessage(raw.payload.message),
      },
    }
  }

  if (
    raw.type === 'message:read' &&
    raw.payload?.chat_id &&
    raw.payload?.user_id &&
    raw.payload?.message_id
  ) {
    return {
      type: 'message:read',
      payload: {
        chatId: raw.payload.chat_id,
        userId: raw.payload.user_id,
        messageId: raw.payload.message_id,
      },
    }
  }

  return null
}

function toWireEvent(event: WsClientEvent) {
  return {
    type: event.type,
    payload: {
      chat_id: event.payload.chatId,
      content: event.payload.content,
      reply_to_id: event.payload.replyToId ?? null,
      client_message_id: event.payload.clientMessageId,
    },
  }
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
        const raw = JSON.parse(String(event.data)) as WireServerEvent
        const parsed = parseServerEvent(raw)
        if (parsed) {
          this.messageListeners.forEach((listener) => listener(parsed))
        }
      } catch {
        // ignore invalid frames
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

    this.socket.send(JSON.stringify(toWireEvent(event)))
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
