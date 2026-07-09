const COOKIE_NAME = 'refreshToken'

export function setRefreshCookie(token: string, maxAgeSeconds: number) {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

export function clearRefreshCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}
