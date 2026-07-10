import type { MeUser } from './user'

export type GoogleLoginRequest = {
  authorizationCode: string
  redirectUri?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type GoogleLoginResult = AuthTokens & {
  user: Pick<
    MeUser,
    'id' | 'email' | 'nickname' | 'profileImageUrl' | 'provider' | 'onboardingCompleted'
  >
}

export type RefreshTokenRequest = {
  refreshToken: string
}
