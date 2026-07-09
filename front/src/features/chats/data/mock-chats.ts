import type { Chat } from '@/types/chat'

export const mockChats: Chat[] = [
  {
    id: '4',
    type: 'group',
    title: 'Базар «Баклажан»',
    lastMessage: 'Собираемся в субботу',
    lastMessageAt: '2026-07-04T18:20:00',
  },
  {
    id: '1',
    type: 'group',
    title: 'Базар «Малина»',
    lastMessage: 'Марина: скинь адрес точки',
    lastMessageAt: '12:52',
    unreadCount: 3,
  },
  {
    lastMessageAt: '2026-07-09T12:52:00',
    unreadCount: 3,
  },
  {
    id: '5',
    type: 'direct',
    title: 'Марина',
    lastMessage: 'Уже еду, буду через 10 минут',
    lastMessageAt: '2026-07-09T13:05:00',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '2',
    type: 'channel',
    title: 'Точка «Смородина»',
    lastMessage: 'Новый пост: расписание на выходные',
    lastMessageAt: '11:40',
    lastMessageAt: '2026-07-09T11:40:00',
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
    lastMessageAt: '2026-07-08T21:15:00',
    isOnline: true,
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
