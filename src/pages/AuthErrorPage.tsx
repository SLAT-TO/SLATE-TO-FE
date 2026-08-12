import { useEffect } from 'react'
import { navigate } from '../utils/navigation'

// 소셜 로그인 실패 시 BE가 리다이렉트하는 화면 (예: ?reason=INVALID_STATE).
// 별도 에러 UI 없이 로그인 화면으로 되돌려 재시도를 유도한다.
export function AuthErrorPage() {
  useEffect(() => {
    navigate('/login', { replace: true })
  }, [])

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <p className="text-body-sm text-neutral-6">로그인에 실패했습니다. 다시 시도해주세요...</p>
    </div>
  )
}
