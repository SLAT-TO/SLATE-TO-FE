import { useEffect } from 'react'
import { refreshToken } from '../api/auth'
import { getMe } from '../api/users'
import { navigate } from '../utils/navigation'

// 소셜 로그인 성공 후 BE가 리다이렉트하는 콜백 화면 (callback-path: /auth/callback).
// BE는 refreshToken만 HttpOnly 쿠키로 내려주므로, 여기서 refresh를 한 번 호출해
// accessToken을 발급받아 저장한다. 온보딩 미완료(신규 유저)면 redirectTo가 있어도
// 무시하고 약관동의부터 거치게 하고, 완료된 유저만 redirectTo(없으면 홈)로 보낸다.
// redirectTo를 온보딩보다 먼저 확인하면, 비로그인 상태로 보호된 경로에 접근했다가
// 라우팅 가드가 실어 보낸 값(예: ?redirectTo=/onboarding)을 신규 유저도 그대로
// 따라가 버려 약관동의를 건너뛰는 문제가 있었다. refresh 실패 시 로그인으로 보낸다.
export function AuthCallbackPage() {
  useEffect(() => {
    let cancelled = false

    refreshToken()
      .then(async () => {
        if (cancelled) return

        try {
          const me = await getMe()
          if (cancelled) return

          if (!me.onboardingCompleted) {
            navigate('/signup/terms')
            return
          }

          const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
          navigate(redirectTo || '/')
        } catch {
          if (!cancelled) navigate('/signup/terms')
        }
      })
      .catch(() => {
        if (!cancelled) navigate('/login')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <p className="text-body-sm text-neutral-6">로그인 처리 중입니다...</p>
    </div>
  )
}
