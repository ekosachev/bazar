import type { User } from '@/types/chat'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  displayName: string
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
