import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import { db, getCurrentUser } from '../db'
import { unauthorized } from '../errors'
import { ok } from '../response'

export const authHandlers = [
  /** GET /api/v1/auth/login/google — 구글 인증 진입 (mock: 콜백으로 리다이렉트) */
  http.get(paths.auth.googleLogin, ({ request }) => {
    const url = new URL(request.url)
    const mockUser = url.searchParams.get('mockUser')
    const user =
      mockUser === 'new'
        ? (db.users.find((u) => !u.onboardingCompleted) ?? db.users[0])
        : (db.users.find((u) => u.onboardingCompleted) ?? db.users[0])

    db.currentUserId = user.id
    db.tokens = {
      accessToken: '',
      refreshToken: `mock-refresh-${user.id}`,
    }

    const redirectTo = url.searchParams.get('redirectTo') || '/auth/callback'
    return HttpResponse.redirect(new URL(redirectTo, url.origin).toString(), 302)
  }),

  http.post(paths.auth.logout, () => {
    if (!getCurrentUser() || !db.tokens) return unauthorized()
    db.tokens = null
    db.currentUserId = null
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  /** POST /api/v1/auth/refresh — 본문 없음, refreshToken은 HttpOnly 쿠키 */
  http.post(paths.auth.refresh, () => {
    if (!db.tokens?.refreshToken) {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: 'COMMON401',
          message: '리프레시 토큰 만료 / 무효',
          result: null,
        },
        { status: 401 },
      )
    }

    db.tokens.accessToken = 'mock-access-refreshed'
    return HttpResponse.json(ok({ accessToken: db.tokens.accessToken }), { status: 200 })
  }),
]
