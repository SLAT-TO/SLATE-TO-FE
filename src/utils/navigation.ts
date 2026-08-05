/** react-router 전환 중 — navigate는 NavigateBridge가 연결한 구현을 쓰고, 없으면 history fallback */

type NavigateOptions = { replace?: boolean }
type NavigateImpl = (to: string, options?: NavigateOptions) => void

let navigateImpl: NavigateImpl | null = null

export function setNavigateImpl(impl: NavigateImpl | null): void {
  navigateImpl = impl
}

export function getPathname(): string {
  return window.location.pathname
}

function isSameUrl(to: string): boolean {
  const current = `${window.location.pathname}${window.location.search}`
  if (to.startsWith('?')) return `${window.location.pathname}${to}` === current
  if (to.includes('?') || to.startsWith('/')) return to === current
  return to === window.location.pathname
}

export function navigate(to: string, options?: NavigateOptions): void {
  // 동일 URL push는 히스토리만 쌓이므로 생략 (replace는 허용)
  if (!options?.replace && isSameUrl(to)) return

  if (navigateImpl) {
    navigateImpl(to, options)
    return
  }
  // Bridge 준비 전 fallback — pushState만 하면 React Router location과 어긋날 수 있음
  if (options?.replace) {
    window.history.replaceState({}, '', to)
  } else {
    window.history.pushState({}, '', to)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i]!
    const pathPart = pathParts[i]!
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart)
      continue
    }
    if (patternPart !== pathPart) return null
  }
  return params
}
