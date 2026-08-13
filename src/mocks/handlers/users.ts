import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type {
  ChangePasswordRequest,
  DeleteAccountRequest,
  OnboardingRequest,
  UpdateProfileRequest,
} from '../../types/user'
import { allocId, db, requireUser, toMeProfile, toPublicUser } from '../db'
import { badRequest, domainError, notFound, unauthorized } from '../errors'
import { created, ok } from '../response'
import type { CreatePortfolioRequest, UpdatePortfolioRequest } from '../../types/portfolio'

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

export const userHandlers = [
  http.get(paths.users.me, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    return HttpResponse.json(ok(toMeProfile(user)), { status: 200 })
  }),

  http.get(paths.users.activityStats, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    return HttpResponse.json(ok(user.stats), { status: 200 })
  }),

  http.get(paths.users.stats(':userId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const user = db.users.find((u) => u.id === Number(params.userId))
    if (!user) return notFound('존재하지 않는 유저')
    return HttpResponse.json(ok(user.stats), { status: 200 })
  }),

  http.post(paths.users.onboarding, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    if (user.onboardingCompleted) {
      return domainError('ONBOARDING409', '이미 온보딩을 완료한 유저')
    }

    const body = (await request.json()) as OnboardingRequest
    if (!body.agreedTerms) {
      return badRequest('필수 약관 미동의')
    }
    if (
      !body.roles?.length ||
      !body.regions?.length ||
      !body.categories?.length ||
      !body.nickname
    ) {
      return badRequest('요청 값이 올바르지 않습니다.')
    }

    const updatedAt = new Date().toISOString()
    user.nickname = body.nickname
    user.bio = body.bio ?? null
    user.profileImageUrl = body.profileImageUrl ?? user.profileImageUrl
    user.roles = body.roles
    // MeUser는 region/location이 단일값 — 온보딩에서 여러 지역을 고르면 첫 번째를 대표 지역으로 저장
    user.region = body.regions[0]!
    user.location = body.regions[0]!
    user.categories = body.categories
    user.primaryRole = body.roles[0] ?? null
    user.onboardingCompleted = true

    return HttpResponse.json(
      ok({
        id: user.id,
        onboardingCompleted: true,
        updatedAt,
      }),
      { status: 200 },
    )
  }),

  http.patch(paths.users.me, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as UpdateProfileRequest

    if (body.nickname) user.nickname = body.nickname
    if (body.bio !== undefined) user.bio = body.bio
    if (body.locations) {
      user.regions = body.locations
      user.location = body.locations[0] ?? null
      user.region = body.locations[0] ?? null
    }
    if (body.profileImageUrl !== undefined) user.profileImageUrl = body.profileImageUrl
    if (body.roles) {
      user.roles = body.roles
      user.primaryRole = body.roles[0] ?? null
    }

    return HttpResponse.json(
      ok({
        id: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        locations: user.regions ?? (user.location ? [user.location] : []),
        primaryRole: user.primaryRole,
        roles: user.roles,
        categories: user.categories,
        updatedAt: new Date().toISOString(),
      }),
      { status: 200 },
    )
  }),

  http.put(paths.users.profileImage, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return badRequest('file 누락')

    const updatedAt = new Date().toISOString()
    // 실제 S3 업로드 대신 object URL로 대체 — 블롭 URL은 오리진 단위로 등록되어
    // MSW 서비스워커에서 만들어도 페이지 쪽 <img>에서 그대로 읽힌다.
    // cdn.example.com 같은 가짜 도메인은 실제로 응답하지 않아 미리보기가 깨진다.
    user.profileImageUrl = URL.createObjectURL(file)

    return HttpResponse.json(ok({ profileImageUrl: user.profileImageUrl, updatedAt }), {
      status: 200,
    })
  }),

  http.delete(paths.users.me, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as Partial<DeleteAccountRequest>
    if (!body.agreed) return badRequest('동의(agreed) 누락')
    if (body.password !== db.passwords[user.id]) return badRequest('비밀번호가 일치하지 않습니다.')

    db.users = db.users.filter((u) => u.id !== user.id)
    delete db.passwords[user.id]
    db.tokens = null
    db.currentUserId = null
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.patch(paths.auth.changePassword, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as Partial<ChangePasswordRequest>
    if (!body.currentPassword || !body.newPassword) return badRequest()
    if (body.currentPassword !== db.passwords[user.id]) {
      return badRequest('현재 비밀번호가 일치하지 않습니다.')
    }
    db.passwords[user.id] = body.newPassword
    db.tokens = {
      accessToken: `mock-access-password-changed-${user.id}`,
      refreshToken: `mock-refresh-password-changed-${user.id}`,
    }
    return HttpResponse.json(
      ok({
        userId: user.id,
        accessToken: db.tokens.accessToken,
        onboardingCompleted: user.onboardingCompleted,
      }),
      { status: 200 },
    )
  }),

  http.get(paths.users.byId(':userId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const userId = Number(params.userId)
    const user = db.users.find((u) => u.id === userId)
    if (!user) return notFound('존재하지 않는 유저')
    return HttpResponse.json(ok(toPublicUser(user)), { status: 200 })
  }),

  http.get(paths.users.portfolios(':userId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const userId = Number(params.userId)
    if (!db.users.some((u) => u.id === userId)) return notFound('존재하지 않는 유저')

    // mock은 전량 반환
    return HttpResponse.json(ok({ items: db.portfolios, nextCursor: null, hasNext: false }), {
      status: 200,
    })
  }),

  http.post(paths.users.myPortfolios, async ({ request }) => {
    if (!safeUser()) return unauthorized()
    const body = (await request.json()) as CreatePortfolioRequest
    if (
      !body.title ||
      !body.type ||
      !body.kind ||
      !body.roles?.length ||
      !body.description ||
      !body.youtubeUrl
    ) {
      return badRequest()
    }

    const portfolio = {
      id: allocId(),
      title: body.title,
      type: body.type,
      kind: body.kind,
      clientName: body.clientName ?? null,
      roles: body.roles,
      description: body.description,
      comment: body.comment ?? null,
      youtubeUrl: body.youtubeUrl,
      thumbnailUrl: 'https://img.youtube.com/vi/mock/maxresdefault.jpg',
    }
    db.portfolios.unshift(portfolio)
    return HttpResponse.json(created(portfolio), { status: 201 })
  }),

  http.get(paths.users.myPortfolio(':portfolioId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const portfolio = db.portfolios.find((p) => p.id === Number(params.portfolioId))
    if (!portfolio) return notFound('포트폴리오가 없거나 내 것이 아님')
    return HttpResponse.json(ok(portfolio), { status: 200 })
  }),

  http.patch(paths.users.myPortfolio(':portfolioId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const portfolio = db.portfolios.find((p) => p.id === Number(params.portfolioId))
    if (!portfolio) return notFound('포트폴리오가 없거나 내 것이 아님')
    const body = (await request.json()) as UpdatePortfolioRequest
    Object.assign(portfolio, body)
    return HttpResponse.json(ok(portfolio), { status: 200 })
  }),

  http.delete(paths.users.myPortfolio(':portfolioId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.portfolioId)
    const exists = db.portfolios.some((p) => p.id === id)
    if (!exists) return notFound('포트폴리오가 없거나 내 것이 아님')
    db.portfolios = db.portfolios.filter((p) => p.id !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  // '/users/me/portfolios/:id'도 이 패턴에 매칭되므로 me 전용 핸들러보다 뒤에 둔다
  http.get(paths.users.portfolio(':userId', ':portfolioId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const userId = Number(params.userId)
    if (!db.users.some((u) => u.id === userId)) return notFound('존재하지 않는 유저')

    // mock은 유저별 포트폴리오를 구분하지 않아 전체에서 id로 찾는다
    const portfolio = db.portfolios.find((p) => p.id === Number(params.portfolioId))
    if (!portfolio) return notFound('존재하지 않는 포트폴리오')
    return HttpResponse.json(ok(portfolio), { status: 200 })
  }),
]
