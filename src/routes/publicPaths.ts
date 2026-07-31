import { matchPath } from '../utils/navigation'

/** 로그인 없이 접근 가능한 진입 화면 (fullscreenRoutes와 별개로 가드 판단용으로 관리) */
const PUBLIC_PATHS = [
  '/login',
  '/landing',
  '/signup',
  '/signup/email-verification',
  '/signup/terms',
]

const PUBLIC_MATCHERS = ['/project-invitations/:token']

export function isPublicPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (PUBLIC_PATHS.includes(path)) return true
  return PUBLIC_MATCHERS.some((pattern) => matchPath(pattern, path) !== null)
}
