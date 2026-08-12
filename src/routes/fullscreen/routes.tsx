import { createElement, lazy } from 'react'
import { navigate } from '../../utils/navigation'
import type { FullscreenRoute } from './types'

const loginPage = lazy(() =>
  import('../../pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })),
)
const authCallbackPage = lazy(() =>
  import('../../pages/AuthCallbackPage').then(({ AuthCallbackPage }) => ({
    default: AuthCallbackPage,
  })),
)
const authErrorPage = lazy(() =>
  import('../../pages/AuthErrorPage').then(({ AuthErrorPage }) => ({ default: AuthErrorPage })),
)
const resetPasswordPage = lazy(() =>
  import('../../pages/ResetPasswordPage').then(({ ResetPasswordPage }) => ({
    default: ResetPasswordPage,
  })),
)
const emailVerifyPage = lazy(() =>
  import('../../pages/EmailVerifyPage').then(({ EmailVerifyPage }) => ({
    default: EmailVerifyPage,
  })),
)
const termsPage = lazy(() =>
  import('../../pages/TermsPage').then(({ TermsPage }) => ({ default: TermsPage })),
)
const inviteAcceptPage = lazy(() =>
  import('../../pages/InviteAcceptPage').then(({ InviteAcceptPage }) => ({
    default: InviteAcceptPage,
  })),
)
const shareLinkGuestPage = lazy(() =>
  import('../../pages/ShareLinkGuestPage').then(({ ShareLinkGuestPage }) => ({
    default: ShareLinkGuestPage,
  })),
)
const signupPage = lazy(() =>
  import('../../pages/SignupPage').then(({ SignupPage }) => ({ default: SignupPage })),
)
const landingPage = lazy(() =>
  import('../../pages/LandingPage').then(({ LandingPage }) => ({ default: LandingPage })),
)
const onboardingPage = lazy(() =>
  import('../../pages/onboarding/OnboardingPage').then(({ OnboardingPage }) => ({
    default: OnboardingPage,
  })),
)

/** 각 기능 PR은 이 배열에만 경로 추가 (App.tsx 수정 금지) */
export const fullscreenRoutes: FullscreenRoute[] = [
  { path: '/login', render: () => createElement(loginPage) },
  { path: '/auth/callback', render: () => createElement(authCallbackPage) },
  { path: '/auth/error', render: () => createElement(authErrorPage) },
  { path: '/reset-password', render: () => createElement(resetPasswordPage) },
  { path: '/signup/email-verification', render: () => createElement(emailVerifyPage) },
  { path: '/signup/terms', render: () => createElement(termsPage) },
  {
    match: '/project-invitations/:token',
    render: (params) => createElement(inviteAcceptPage, { token: params.token! }),
  },
  {
    match: '/share/:token',
    render: (params) =>
      createElement(shareLinkGuestPage, { key: params.token, token: params.token! }),
  },
  { path: '/signup', render: () => createElement(signupPage) },
  { path: '/landing', render: () => createElement(landingPage) },
  {
    path: '/onboarding',
    render: () => createElement(onboardingPage, { onComplete: () => navigate('/') }),
  },
]
