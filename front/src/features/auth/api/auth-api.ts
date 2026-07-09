import { apiFetch } from '@/lib/http-client'
import type { User } from '@/types/chat'
import type { AuthTokens, LoginPayload, RegisterPayload } from '@/features/auth/types'

interface UserApiResponse {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url: string | null
  created_at: string
}

interface TokensApiResponse {
  access: string
  refresh: string
}

function toUser(response: UserApiResponse): User {
  return {
    id: response.id,
    username: response.username,
    displayName: response.display_name,
    avatarUrl: response.avatar_url ?? undefined,
  }
}

function toTokens(response: TokensApiResponse): AuthTokens {
  return { accessToken: response.access, refreshToken: response.refresh }
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const response = await apiFetch<TokensApiResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
  return toTokens(response)
}

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await apiFetch<UserApiResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: payload.username,
      display_name: payload.displayName,
      email: payload.email,
      password: payload.password,
    }),
    skipAuth: true,
  })
  return toUser(response)
}

export async function refresh(): Promise<AuthTokens> {
  const response = await apiFetch<TokensApiResponse>('/auth/refresh', {
    method: 'GET',
    skipAuth: true,
    credentials: 'include',
  })
  return toTokens(response)
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'GET' })
}

export async function getMe() {
  return apiFetch<{ user_id: string }>('/auth/me', { method: 'GET' })
}

export async function getUserById(userId: string): Promise<User> {
  const response = await apiFetch<UserApiResponse>(`/user/${userId}`, { method: 'GET' })
  return toUser(response)
}
