import { http, HttpResponse } from 'msw'
import type { GoogleLoginRequest, RefreshTokenRequest } from '../../types/auth'
import { paths } from '../../api/paths'
import { db, getCurrentUser } from '../db'
import { unauthorized } from '../errors'
import { ok, statusOf } from '../response'

export const authHandlers = [
  // TODO(논의 필요): 현재 Notion 명세는 FE가 Google code를 받아 POST로 백에 전달하는 흐름.
  // code 노출·Hop 측면에서 redirect_uri를 백엔드 콜백으로 두고 FE에는 토큰만 주는 구조가 더 나을 수 있음.
  // 백/명세와 OAuth 콜백 위치(FE vs BE) 확정 후 mock·API 계약 재검토.
  http.post(paths.auth.googleLogin, async ({ request }) => {
    const body = (await request.json()) as GoogleLoginRequest
    /* 가로챈 요청에 인가 코드가 없으면 400 에러 반환 */
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
    // authorizationCode로 시나리오 분기
    // - mock-new → 온보딩 미완료 유저 (온보딩 테스트)
    // - 그 외(예: mock-code) → 온보딩 완료 유저 (일반 기능 테스트)
    const user =
      body.authorizationCode === 'mock-new'
        ? (db.users.find((u) => !u.onboardingCompleted) ?? db.users[0])
        : (db.users.find((u) => u.onboardingCompleted) ?? db.users[0])
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
