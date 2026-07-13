import * as authApi from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { User } from '@/types/chat'

const cache = new Map<string, User>()
const pending = new Map<string, Promise<User | null>>()

/**
 * WS/REST message payloads only carry sender_id — the backend never sends a
 * display name. Resolve it once per user and cache it for subsequent messages.
 */
export async function resolveSenderName(senderId: string): Promise<string | undefined> {
  const currentUser = useAuthStore.getState().user
  if (currentUser?.id === senderId) {
    return currentUser.displayName
  }

  const cached = cache.get(senderId)
  if (cached) {
    return cached.displayName
  }

  let request = pending.get(senderId)
  if (!request) {
    request = authApi.getUserById(senderId).catch(() => null)
    pending.set(senderId, request)
  }

  const user = await request
  pending.delete(senderId)

  if (!user) {
    return undefined
  }

  cache.set(senderId, user)
  return user.displayName
}
