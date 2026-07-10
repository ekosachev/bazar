import { useAuthStore } from '@/features/auth/store/auth-store'
import { mockUsers } from '@/features/chats/data/mock-users'
import type { User } from '@/types/chat'

export function resolveUser(userId: string): User | undefined {
  const currentUser = useAuthStore.getState().user
  if (currentUser?.id === userId) return currentUser

  return mockUsers.find((user) => user.id === userId)
}
