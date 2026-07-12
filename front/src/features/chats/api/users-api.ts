import { apiFetch } from '@/lib/http-client'
import type { User } from '@/types/chat'

interface UserApiResponse {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url: string | null
  created_at: string
}

function toUser(response: UserApiResponse): User {
  return {
    id: response.id,
    username: response.username,
    displayName: response.display_name,
    avatarUrl: response.avatar_url ?? undefined,
  }
}

export async function searchUsers(username: string): Promise<User[]> {
  const params = new URLSearchParams({ username })
  const response = await apiFetch<UserApiResponse[]>(`/user/search?${params}`, { method: 'GET' })
  return response.map(toUser)
}
