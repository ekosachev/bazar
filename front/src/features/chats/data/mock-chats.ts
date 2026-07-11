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

export const mockOlderMessages = [
  {
    id: 'm0-2',
    chatId: '1',
    senderId: 'u4',
    senderName: 'Алексей',
    content: 'Кто-нибудь уже на месте?',
    createdAt: '12:35',
  },
  {
    id: 'm0-1',
    chatId: '1',
    senderId: 'u2',
    senderName: 'Марина',
    content: 'Сегодня на базаре много народу.',
    createdAt: '12:30',
  },
]
