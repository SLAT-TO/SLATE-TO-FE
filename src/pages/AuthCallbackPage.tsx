import { useEffect } from 'react'
import { refreshToken, startGoogleLogin } from '../api/auth'
import { getMe } from '../api/users'
import { navigate, sanitizeRedirectTo } from '../utils/navigation'

// 소셜 로그인 리다이렉트 직후엔 refreshToken 쿠키가 막 내려온 시점이라, 브라우저/네트워크
// 타이밍에 따라 첫 refresh 요청이 간헐적으로 실패하는 경우가 있다(로그인은 정상 성공했는데
// 매번은 아니고 가끔씩만 로그인 화면으로 되돌아가는 문제로 나타남). 실패 시 곧바로 로그인으로
// 보내기 전에 짧은 대기 후 한 번 더 시도해 이런 일시적 실패를 흡수한다.
async function refreshTokenWithRetry(retriesLeft = 1): Promise<void> {
  try {
    await refreshToken()
  } catch (err) {
    if (retriesLeft <= 0) throw err
    await new Promise((resolve) => setTimeout(resolve, 500))
    return refreshTokenWithRetry(retriesLeft - 1)
  }
}

// 구글 로그인은 최초 한 번은 실패하고 다시 시도하면 바로 되는 경우가 있다 —
// 크로스 도메인 쿠키(refreshToken)를 그 도메인에 처음 받는 시점엔 브라우저가
// 거부했다가, 한 번 거친 뒤부터는 정상적으로 받아들이는 브라우저 특성으로 보인다.
// 같은 페이지 안에서의 재시도(refreshTokenWithRetry)로는 못 넘는 케이스라,
// 구글 로그인 자체를 자동으로 한 번 더 태워 사용자가 직접 두 번 누르지 않게 한다.
const GOOGLE_AUTO_RETRY_KEY = 'slate_google_auth_auto_retry'

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

    const redirectTo = sanitizeRedirectTo(
      new URLSearchParams(window.location.search).get('redirectTo'),
    )

    refreshTokenWithRetry()
      .then(async () => {
        if (cancelled) return
        sessionStorage.removeItem(GOOGLE_AUTO_RETRY_KEY)

        try {
          const me = await getMe()
          if (cancelled) return

          if (!me.onboardingCompleted) {
            navigate('/signup/terms')
            return
          }

          navigate(redirectTo || '/')
        } catch {
          if (!cancelled) navigate('/signup/terms')
        }
      })
      .catch(() => {
        if (cancelled) return

        if (!sessionStorage.getItem(GOOGLE_AUTO_RETRY_KEY)) {
          sessionStorage.setItem(GOOGLE_AUTO_RETRY_KEY, '1')
          void startGoogleLogin({ redirectTo })
          return
        }

        sessionStorage.removeItem(GOOGLE_AUTO_RETRY_KEY)
        navigate('/login')
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
