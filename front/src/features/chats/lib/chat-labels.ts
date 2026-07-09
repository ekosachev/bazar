import type { ChatType } from '@/types/chat'

const labels: Record<ChatType, string | null> = {
  group: 'Базар',
  channel: 'Точка',
  direct: null,
}

export function getChatTypeLabel(type: ChatType) {
  return labels[type]
}
