/** react-router 도입 전 임시 pathname 라우팅 */

export function getPathname(): string {
  return window.location.pathname
}

export function navigate(to: string): void {
  if (to === getPathname()) return
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
