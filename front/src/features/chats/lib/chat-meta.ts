import type { Chat } from '@/types/chat'

function pluralizeParticipants(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} участник`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} участника`
  }

  return `${count} участников`
}

export function getChatSubtitle(chat: Chat) {
  if (chat.type === 'group') {
    const count = chat.participantIds?.length ?? 0
    return count > 0 ? pluralizeParticipants(count) : 'Базар'
  }

  if (chat.type === 'channel') {
    return chat.description?.trim() || 'Точка'
  }

  if (chat.type === 'direct') {
    return chat.isOnline ? 'В сети' : 'Личный чат'
  }

  return ''
}
