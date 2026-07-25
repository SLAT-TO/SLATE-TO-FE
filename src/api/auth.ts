import { request, setAccessToken } from './client'
import { paths } from './paths'
import type { AuthTokens, RefreshTokenResult } from '../types/auth'

const apiBase = import.meta.env.VITE_API_BASE_URL || ''

/** GET /api/v1/auth/login/google — 구글 인증 페이지로 리다이렉트 */
export function startGoogleLogin(options?: {
  redirectTo?: string
  /** mock 전용: new=온보딩 미완료, complete=온보딩 완료 */
  mockUser?: 'new' | 'complete'
}): void {
  const params = new URLSearchParams()
  if (options?.redirectTo) params.set('redirectTo', options.redirectTo)
  if (options?.mockUser) params.set('mockUser', options.mockUser)
  const qs = params.toString()
  window.location.href = `${apiBase}${paths.auth.googleLogin}${qs ? `?${qs}` : ''}`
}

export async function logout(): Promise<null> {
  try {
    return await request<null>({
      method: 'POST',
      url: paths.auth.logout,
    })
  } finally {
    setAccessToken(null)
  }
}

/** POST /api/v1/auth/refresh — refreshToken은 HttpOnly 쿠키, 본문 없음 */
export async function refreshToken(): Promise<RefreshTokenResult> {
  const result = await request<RefreshTokenResult>({
    method: 'POST',
    url: paths.auth.refresh,
    withCredentials: true,
  })
  setAccessToken(result.accessToken)
  return result
}

/** mock/dev: refresh 쿠키 없이 토큰 직접 주입 */
export function setMockAuthTokens(tokens: AuthTokens): void {
  setAccessToken(tokens.accessToken)
}
