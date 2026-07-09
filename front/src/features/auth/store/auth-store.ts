import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { configureApiClient } from '@/lib/http-client'
import * as authApi from '@/features/auth/api/auth-api'
import { getUserIdFromToken } from '@/features/auth/lib/jwt'
import { clearRefreshCookie, setRefreshCookie } from '@/features/auth/lib/refresh-cookie'
import type { User } from '@/types/chat'
import type { AuthTokens, LoginPayload, RegisterPayload } from '@/features/auth/types'

const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

async function establishSession(
  set: (state: Partial<AuthState>) => void,
  tokens: AuthTokens,
) {
  setRefreshCookie(tokens.refreshToken, REFRESH_COOKIE_MAX_AGE)

  const userId = getUserIdFromToken(tokens.accessToken)
  const user = userId ? await authApi.getUserById(userId) : null

  set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (payload) => {
        const tokens = await authApi.login(payload)
        await establishSession(set, tokens)
      },

      register: async (payload) => {
        await authApi.register(payload)
        const tokens = await authApi.login({ username: payload.username, password: payload.password })
        await establishSession(set, tokens)
      },

      logout: () => {
        const { accessToken } = get()
        set({ user: null, accessToken: null, refreshToken: null })
        clearRefreshCookie()
        if (accessToken) {
          authApi.logout().catch(() => {})
        }
      },
    }),
    {
      name: 'bazar-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)

configureApiClient({
  getAccessToken: () => useAuthStore.getState().accessToken,

  refreshAccessToken: async () => {
    try {
      const tokens = await authApi.refresh()
      setRefreshCookie(tokens.refreshToken, REFRESH_COOKIE_MAX_AGE)
      useAuthStore.setState({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
      return tokens.accessToken
    } catch {
      useAuthStore.getState().logout()
      return null
    }
  },

  onUnauthorized: () => {
    useAuthStore.getState().logout()
  },
})
