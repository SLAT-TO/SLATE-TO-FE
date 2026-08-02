import { useEffect } from 'react'
import { getAccessToken } from '../api/client'
import { refreshToken } from '../api/auth'
import { navigate } from '../utils/navigation'
import { isPublicPath } from '../routes/publicPaths'

/**
 * 보호된 경로에 로컬 액세스 토큰이 없으면 우선 refreshToken()으로 조용히 재발급을
 * 시도한다 (예: 소셜 로그인 리다이렉트 직후엔 리프레시 쿠키만 있고 로컬 액세스
 * 토큰은 아직 없음). 그것도 실패하면 진짜 비로그인 상태로 보고 /login으로 보낸다.
 */
export function useAuthGuard(pathname: string): void {
  useEffect(() => {
    if (isPublicPath(pathname)) return
    if (getAccessToken()) return

    let cancelled = false
    refreshToken().catch(() => {
      if (!cancelled) navigate(`/login?redirectTo=${encodeURIComponent(pathname)}`)
    })
    return () => {
      cancelled = true
    }
  }, [pathname])
}
