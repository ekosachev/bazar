import type { Message } from '@/types/chat'

/** Событие, которое клиент отправляет на сервер — реальный бэкенд поддерживает только его. */
export type WsClientEventType = 'message:send'

/** События, которые сервер присылает клиенту. */
export type WsServerEventType = 'message:new' | 'message:sent' | 'message:read' | 'error'

export interface WsSendMessagePayload {
  chatId: string
  content: string
  replyToId?: string
  /** Клиентский id для дедупликации и идемпотентности */
  clientMessageId: string
}

export interface WsMessageNewPayload {
  message: Message
}

export interface WsMessageSentPayload {
  clientMessageId: string
  message: Message
}

export interface WsMessageReadPayload {
  chatId: string
  userId: string
  messageId: string
}

export type WsClientEvent = { type: 'message:send'; payload: WsSendMessagePayload }

export type WsServerEvent =
  | { type: 'message:new'; payload: WsMessageNewPayload }
  | { type: 'message:sent'; payload: WsMessageSentPayload }
  | { type: 'message:read'; payload: WsMessageReadPayload }
  | { type: 'error'; code: string; description: string }

export type WsEvent = WsClientEvent | WsServerEvent

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
