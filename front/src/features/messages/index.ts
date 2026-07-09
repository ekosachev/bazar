export type {
  WsClientEvent,
  WsClientEventType,
  WsConnectionStatus,
  WsEvent,
  WsMessageAckPayload,
  WsMessageErrorPayload,
  WsMessageNewPayload,
  WsMessageSentPayload,
  WsSendMessagePayload,
  WsServerEvent,
  WsServerEventType,
  WsSubscribePayload,
  WsSubscribedPayload,
  WsUnsubscribePayload,
} from './types/ws-events'

export { useActiveChatMessages, useMessagesStore } from './store/messages-store'
// WebSocket provider, reconnect, event dispatch — real-time layer
