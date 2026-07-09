interface AccessTokenClaims {
  sub: string
  exp: number
}

export function getUserIdFromToken(accessToken: string): string | null {
  const payload = accessToken.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(base64)) as AccessTokenClaims
    return claims.sub ?? null
  } catch {
    return null
  }
}
