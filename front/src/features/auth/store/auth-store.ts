import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { configureApiClient } from '@/lib/http-client'
import * as authApi from '@/features/auth/api/auth-api'
import type { User } from '@/types/chat'
import type { LoginPayload, RegisterPayload } from '@/features/auth/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (payload) => {
        const { user, tokens } = await authApi.login(payload)
        set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
      },

      register: async (payload) => {
        const { user, tokens } = await authApi.register(payload)
        set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
      },

      logout: () => {
        const { refreshToken } = get()
        set({ user: null, accessToken: null, refreshToken: null })
        if (refreshToken) {
          authApi.logout(refreshToken).catch(() => {})
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
    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) return null

    try {
      const tokens = await authApi.refresh(refreshToken)
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
