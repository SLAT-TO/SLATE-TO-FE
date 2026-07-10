import { http, HttpResponse } from 'msw'
import type { GoogleLoginRequest, RefreshTokenRequest } from '../../types/auth'
import { paths } from '../../api/paths'
import { db, getCurrentUser } from '../db'
import { unauthorized } from '../errors'
import { ok, statusOf } from '../response'

export const authHandlers = [
  http.post(paths.auth.googleLogin, async ({ request }) => {
    const body = (await request.json()) as GoogleLoginRequest
    if (!body.authorizationCode) {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: 'COMMON400',
          message: '인가 코드가 유효하지 않거나 만료됨',
          result: null,
        },
        { status: 400 },
      )
    }

    const user = db.users.find((u) => u.onboardingCompleted) ?? db.users[0]
    db.currentUserId = user.id
    db.tokens = {
      accessToken: `mock-access-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
    }

    return HttpResponse.json(
      ok({
        accessToken: db.tokens.accessToken,
        refreshToken: db.tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
          provider: user.provider,
          onboardingCompleted: user.onboardingCompleted,
        },
      }),
      { status: statusOf('COMMON200') },
    )
  }),

  http.post(paths.auth.logout, () => {
    if (!getCurrentUser() || !db.tokens) return unauthorized()
    db.tokens = null
    db.currentUserId = null
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.post(paths.auth.refresh, async ({ request }) => {
    const body = (await request.json()) as RefreshTokenRequest
    if (!body.refreshToken || !db.tokens || body.refreshToken !== db.tokens.refreshToken) {
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

    db.tokens = {
      accessToken: 'mock-access-refreshed',
      refreshToken: 'mock-refresh-refreshed',
    }

    return HttpResponse.json(ok(db.tokens), { status: 200 })
  }),
]
