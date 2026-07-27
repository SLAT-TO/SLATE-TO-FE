import { request, setAccessToken } from './client'
import { paths } from './paths'
import { navigate } from '../utils/navigation'
import type { AuthTokens, RefreshTokenResult } from '../types/auth'

const apiBase = import.meta.env.VITE_API_BASE_URL || ''

/** GET /api/v1/auth/login/google — 구글 인증 페이지로 리다이렉트 */
export async function startGoogleLogin(options?: {
  redirectTo?: string
  /** mock 전용: new=온보딩 미완료, complete=온보딩 완료 */
  mockUser?: 'new' | 'complete'
}): Promise<void> {
  const params = new URLSearchParams()
  if (options?.redirectTo) params.set('redirectTo', options.redirectTo)
  if (options?.mockUser) params.set('mockUser', options.mockUser)
  const qs = params.toString()
  const url = `${apiBase}${paths.auth.googleLogin}${qs ? `?${qs}` : ''}`

  if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    // MSW 서비스워커가 최상위 브라우저 내비게이션(location.href)은 안정적으로
    // 가로채지 못해(fetch/XHR만 확실히 인터셉트) 302를 fetch로 직접 따라가 SPA
    // 라우터로 이동시킨다. 실 BE 연동 시(VITE_ENABLE_MSW=false)엔 아래
    // location.href 분기로 실제 Google OAuth 리다이렉트를 태운다.
    const res = await fetch(url, { redirect: 'follow' })
    navigate(new URL(res.url).pathname)
    return
  }

  window.location.href = url
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
