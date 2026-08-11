export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type EmailVerificationPurpose = 'SIGNUP' | 'PASSWORD_RESET'

export type SendEmailVerificationRequest = {
  email: string
  purpose: EmailVerificationPurpose
}

export type SendEmailVerificationResult = {
  expiresAt: string
  resendAvailableAt: string
}

export type ConfirmEmailVerificationRequest = {
  email: string
  code: string
  purpose: EmailVerificationPurpose
}

export type ConfirmEmailVerificationResult = {
  verifiedUntil: string
}

export type EmailSignupRequest = {
  name: string
  email: string
  password: string
}

export type EmailSignupResult = {
  userId: number
  accessToken: string
  onboardingCompleted: boolean
}

export type EmailLoginRequest = {
  email: string
  password: string
}

/** 이메일 미존재·비밀번호 불일치·소셜 전용 계정을 구분하지 않고 모두 같은 401을 반환함 */
export type EmailLoginResult = {
  userId: number
  accessToken: string
  onboardingCompleted: boolean
}

export type PasswordResetRequest = {
  email: string
  newPassword: string
}
