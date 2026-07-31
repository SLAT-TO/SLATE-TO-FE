import { matchPath } from '../utils/navigation'

/** 로그인 없이 접근 가능한 진입 화면 (fullscreenRoutes와 별개로 가드 판단용으로 관리) */
const PUBLIC_PATHS = [
  '/login',
  '/landing',
  '/signup',
  '/signup/email-verification',
  '/signup/terms',
  '/matching',
]

const PUBLIC_MATCHERS = ['/project-invitations/:token']

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
