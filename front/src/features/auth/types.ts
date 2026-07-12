export interface LoginPayload {
  username: string
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

export interface UpdateProfilePayload {
  username?: string
  displayName?: string
}
