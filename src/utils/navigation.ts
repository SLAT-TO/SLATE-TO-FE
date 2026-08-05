/** react-router 전환 중 — navigate는 NavigateBridge가 연결한 구현을 쓰고, 없으면 history fallback */

type NavigateImpl = (to: string) => void

let navigateImpl: NavigateImpl | null = null

export function setNavigateImpl(impl: NavigateImpl | null): void {
  navigateImpl = impl
}

export function getPathname(): string {
  return window.location.pathname
}

export function navigate(to: string): void {
  if (to === getPathname()) return
  if (navigateImpl) {
    navigateImpl(to)
    return
  }
  window.history.pushState({}, '', to)
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
