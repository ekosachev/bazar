import type { User } from '@/types/chat'

/**
 * Test accounts registered on the local backend, used as a stand-in participant
 * directory until real user search (GET /user/search) is wired up.
 */
export const mockUsers: User[] = [
  { id: '307a56cc-5f5b-422a-b7b8-1f135afa9b6f', username: 'marina', displayName: 'Марина' },
  { id: 'f6fd0bc0-ff64-459c-bd2c-98867a8a15c6', username: 'alexey', displayName: 'Алексей' },
  { id: '3e7c090c-54a7-43c0-a6f1-bbf12681df72', username: 'igor', displayName: 'Игорь' },
]
