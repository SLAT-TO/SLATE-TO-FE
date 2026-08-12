import { matchPath } from '../utils/navigation'

/** 로그인 없이 접근 가능한 진입 화면 (fullscreenRoutes와 별개로 가드 판단용으로 관리) */
const PUBLIC_PATHS = [
  '/login',
  '/auth/callback',
  '/auth/error',
  '/reset-password',
  '/landing',
  '/signup',
  '/signup/email-verification',
  '/signup/terms',
  '/share',
  '/matching',
]

// 초대 수락(/project-invitations/:token)은 실제 프로젝트 멤버십을 만드는 로그인 전용
// 동작이라 공개 경로에서 뺀다 — 비로그인 상태로 들어오면 useAuthGuard가
// /login?redirectTo=로 보내고, 로그인 성공 후 다시 이 경로로 돌아온다.
const PUBLIC_MATCHERS = ['/share/:token']

// /matching/:jobId(공고 상세)는 공개, 같은 위치의 /matching/my·/matching/new는
// 로그인이 필요해 matchPath만으로는 구분이 안 되므로 먼저 제외한다.
const PRIVATE_MATCHING_PATHS = ['/matching/my', '/matching/new']

function isPublicJobDetail(path: string): boolean {
  if (PRIVATE_MATCHING_PATHS.includes(path)) return false
  return matchPath('/matching/:jobId', path) !== null
}

export function isPublicPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (PUBLIC_PATHS.includes(path)) return true
  if (isPublicJobDetail(path)) return true
  return PUBLIC_MATCHERS.some((pattern) => matchPath(pattern, path) !== null)
}
