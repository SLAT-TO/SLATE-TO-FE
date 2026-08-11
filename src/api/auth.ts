import { request, setAccessToken, refreshAccessToken } from './client'
import { paths } from './paths'
import { navigate } from '../utils/navigation'
import type {
  AuthTokens,
  ConfirmEmailVerificationRequest,
  ConfirmEmailVerificationResult,
  EmailSignupRequest,
  EmailSignupResult,
  PasswordResetRequest,
  SendEmailVerificationRequest,
  SendEmailVerificationResult,
} from '../types/auth'

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

/** POST /api/v1/auth/email/verification-codes — 이메일로 6자리 인증번호 발송 (5분 유효) */
export async function sendEmailVerificationCode(
  body: SendEmailVerificationRequest,
): Promise<SendEmailVerificationResult> {
  return request<SendEmailVerificationResult>({
    method: 'POST',
    url: paths.auth.emailVerificationCodes,
    data: body,
  })
}

/** POST /api/v1/auth/email/verification-codes/confirm — 인증번호 확인, 성공 후 30분 안에 가입 완료해야 함 */
export async function confirmEmailVerificationCode(
  body: ConfirmEmailVerificationRequest,
): Promise<ConfirmEmailVerificationResult> {
  return request<ConfirmEmailVerificationResult>({
    method: 'POST',
    url: paths.auth.emailVerificationConfirm,
    data: body,
  })
}

/** POST /api/v1/auth/signup — 이메일 인증을 마친 사용자의 계정 생성, 성공 시 즉시 로그인 상태가 됨 */
export async function signupWithEmail(body: EmailSignupRequest): Promise<EmailSignupResult> {
  const result = await request<EmailSignupResult>({
    method: 'POST',
    url: paths.auth.signup,
    data: body,
  })
  setAccessToken(result.accessToken)
  return result
}

/** POST /api/v1/auth/password/reset — 이메일 인증 완료 후 새 비밀번호로 재설정 */
export async function resetPassword(body: PasswordResetRequest): Promise<null> {
  return request<null>({
    method: 'POST',
    url: paths.auth.passwordReset,
    data: body,
  })
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

/**
 * POST /api/v1/auth/refresh — refreshToken은 HttpOnly 쿠키, 본문 없음.
 * 실제 구현은 client.ts에 있음 — 401 인터셉터와 같은 함수·같은 in-flight promise를
 * 공유해야 해서, client.ts가 auth.ts를 참조하는 대신 여기서 client.ts를 재노출한다.
 */
export const refreshToken = refreshAccessToken

/** mock/dev: refresh 쿠키 없이 토큰 직접 주입 */
export function setMockAuthTokens(tokens: AuthTokens): void {
  setAccessToken(tokens.accessToken)
}
