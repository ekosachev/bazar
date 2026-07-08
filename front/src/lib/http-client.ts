const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean
}

interface ApiClientConfig {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string | null>
  onUnauthorized: () => void
}

let config: ApiClientConfig = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
  onUnauthorized: () => {},
}

export function configureApiClient(nextConfig: ApiClientConfig) {
  config = nextConfig
}

let refreshPromise: Promise<string | null> | null = null

function refreshOnce() {
  refreshPromise ??= config.refreshAccessToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function send(path: string, options: ApiFetchOptions, accessToken: string | null) {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  let response = await send(path, options, options.skipAuth ? null : config.getAccessToken())

  if (response.status === 401 && !options.skipAuth) {
    const refreshedToken = await refreshOnce()
    if (!refreshedToken) {
      config.onUnauthorized()
      throw new ApiError(401, 'Unauthorized')
    }
    response = await send(path, options, refreshedToken)
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ApiError(response.status, message || 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
