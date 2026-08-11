import { useEffect } from 'react'
import { refreshToken } from '../api/auth'
import { getMe } from '../api/users'
import { navigate } from '../utils/navigation'

// 소셜 로그인 성공 후 BE가 리다이렉트하는 콜백 화면 (callback-path: /auth/callback).
// BE는 refreshToken만 HttpOnly 쿠키로 내려주므로, 여기서 refresh를 한 번 호출해
// accessToken을 발급받아 저장한다. redirectTo 쿼리가 있으면 그곳으로, 없으면
// 온보딩 완료 여부에 따라 홈/약관동의(신규 유저)로 이동하고, refresh 실패 시 로그인으로 보낸다.
export function AuthCallbackPage() {
  useEffect(() => {
    let cancelled = false

    refreshToken()
      .then(async () => {
        if (cancelled) return

        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
        if (redirectTo) {
          navigate(redirectTo)
          return
        }

        try {
          const me = await getMe()
          if (!cancelled) navigate(me.onboardingCompleted ? '/' : '/signup/terms')
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
