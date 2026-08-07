import { LoginPage } from '../../pages/LoginPage'
import { AuthCallbackPage } from '../../pages/AuthCallbackPage'
import { EmailVerifyPage } from '../../pages/EmailVerifyPage'
import { TermsPage } from '../../pages/TermsPage'
import { InviteAcceptPage } from '../../pages/InviteAcceptPage'
import { SignupPage } from '../../pages/SignupPage'
import { LandingPage } from '../../pages/LandingPage'
import { OnboardingPage } from '../../pages/onboarding/OnboardingPage'
import { navigate } from '../../utils/navigation'
import type { FullscreenRoute } from './types'

/** 각 기능 PR은 이 배열에만 경로 추가 (App.tsx 수정 금지) */
export const fullscreenRoutes: FullscreenRoute[] = [
  { path: '/login', render: () => <LoginPage /> },
  { path: '/auth/callback', render: () => <AuthCallbackPage /> },
  { path: '/signup/email-verification', render: () => <EmailVerifyPage /> },
  { path: '/signup/terms', render: () => <TermsPage /> },
  {
    match: '/project-invitations/:token',
    render: (params) => <InviteAcceptPage token={params.token!} />,
  },
  { path: '/signup', render: () => <SignupPage /> },
  { path: '/landing', render: () => <LandingPage /> },
  { path: '/onboarding', render: () => <OnboardingPage onComplete={() => navigate('/')} /> },
]
