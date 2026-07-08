import type { Chat } from '@/types/chat'

export const mockChats: Chat[] = [
  {
    id: '1',
    type: 'group',
    title: 'Базар «Малина»',
    lastMessage: 'Марина: скинь адрес точки',
    lastMessageAt: '12:52',
    unreadCount: 3,
  },
  {
    id: '2',
    type: 'channel',
    title: 'Точка «Смородина»',
    lastMessage: 'Новый пост: расписание на выходные',
    lastMessageAt: '11:40',
  },
  {
    id: '3',
    type: 'direct',
    title: 'Алексей',
    lastMessage: 'До встречи на базаре',
    lastMessageAt: 'вчера',
    isOnline: true,
  },
  {
    id: '4',
    type: 'group',
    title: 'Базар «Баклажан»',
    lastMessage: 'Собираемся в субботу',
    lastMessageAt: 'пн',
  },
]

export const mockMessages = [
  {
    id: 'm1',
    chatId: '1',
    senderId: 'u2',
    senderName: 'Марина',
    content: 'Привет! Ты уже на базаре?',
    createdAt: '12:48',
  },
  {
    id: 'm2',
    chatId: '1',
    senderId: 'me',
    content: 'Только подхожу к точке со смородиной.',
    createdAt: '12:50',
    isOwn: true,
  },
  {
    id: 'm3',
    chatId: '1',
    senderId: 'u2',
    senderName: 'Марина',
    content: 'Скинь адрес точки, пожалуйста.',
    createdAt: '12:52',
  },
]
