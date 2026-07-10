import { request, setAccessToken } from './client'
import { paths } from './paths'
import type {
  GoogleLoginRequest,
  GoogleLoginResult,
  AuthTokens,
  RefreshTokenRequest,
} from '../types/auth'

export async function loginWithGoogle(body: GoogleLoginRequest): Promise<GoogleLoginResult> {
  const result = await request<GoogleLoginResult>({
    method: 'POST',
    url: paths.auth.googleLogin,
    data: body,
  })
  setAccessToken(result.accessToken)
  return result
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

export async function refreshToken(body: RefreshTokenRequest): Promise<AuthTokens> {
  const result = await request<AuthTokens>({
    method: 'POST',
    url: paths.auth.refresh,
    data: body,
  })
  setAccessToken(result.accessToken)
  return result
}
