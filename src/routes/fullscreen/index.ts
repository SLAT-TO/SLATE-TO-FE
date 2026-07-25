import { matchPath } from '../../utils/navigation'
import { fullscreenRoutes } from './routes.tsx'
import type { FullscreenRoute } from './types'

export const FULLSCREEN_ROUTES: FullscreenRoute[] = [...fullscreenRoutes]

export function renderFullscreenRoute(pathname: string) {
  for (const route of FULLSCREEN_ROUTES) {
    if ('match' in route) {
      const params = matchPath(route.match, pathname)
      if (params) return route.render(params)
      continue
    }
    if (pathname === route.path) return route.render()
  }
  return null
}
