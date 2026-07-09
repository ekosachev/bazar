import type { Message } from '@/types/chat'

/** События, которые клиент отправляет на сервер */
export type WsClientEventType = 'subscribe' | 'unsubscribe' | 'send_message' | 'ping'

/** События, которые сервер присылает клиенту */
export type WsServerEventType =
  | 'connected'
  | 'subscribed'
  | 'message:new'
  | 'message:sent'
  | 'message:ack'
  | 'message:error'
  | 'pong'

export interface WsSubscribePayload {
  chatIds: string[]
}

export interface WsUnsubscribePayload {
  chatIds: string[]
}

export interface WsSendMessagePayload {
  chatId: string
  content: string
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

export interface WsMessageAckPayload {
  messageId: string
  clientMessageId?: string
}

export interface WsMessageErrorPayload {
  clientMessageId?: string
  code: string
  message: string
}

export interface WsSubscribedPayload {
  chatIds: string[]
}

export type WsClientEvent =
  | { type: 'subscribe'; payload: WsSubscribePayload }
  | { type: 'unsubscribe'; payload: WsUnsubscribePayload }
  | { type: 'send_message'; payload: WsSendMessagePayload }
  | { type: 'ping' }

export type WsServerEvent =
  | { type: 'connected' }
  | { type: 'subscribed'; payload: WsSubscribedPayload }
  | { type: 'message:new'; payload: WsMessageNewPayload }
  | { type: 'message:sent'; payload: WsMessageSentPayload }
  | { type: 'message:ack'; payload: WsMessageAckPayload }
  | { type: 'message:error'; payload: WsMessageErrorPayload }
  | { type: 'pong' }

export type WsEvent = WsClientEvent | WsServerEvent

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
