import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type { OnboardingRequest, UpdateProfileRequest } from '../../types/user'
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
    if (!body.roles?.length || !body.region || !body.categories?.length || !body.nickname) {
      return badRequest('요청 값이 올바르지 않습니다.')
    }

    const updatedAt = new Date().toISOString()
    user.nickname = body.nickname
    user.bio = body.bio ?? null
    user.profileImageUrl = body.profileImageUrl ?? user.profileImageUrl
    user.roles = body.roles
    user.region = body.region
    user.location = body.region
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
    if (body.location) user.location = body.location
    if (body.profileImageUrl !== undefined) user.profileImageUrl = body.profileImageUrl
    if (body.roles) {
      user.roles = body.roles
      user.primaryRole = body.roles[0] ?? null
    }

    return HttpResponse.json(ok(toMeProfile(user)), { status: 200 })
  }),

  http.delete(paths.users.me, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as { agreed?: boolean }
    if (!body.agreed) return badRequest('동의(agreed) 누락')

    db.users = db.users.filter((u) => u.id !== user.id)
    db.tokens = null
    db.currentUserId = null
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.get(paths.users.byId(':userId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const userId = Number(params.userId)
    const user = db.users.find((u) => u.id === userId)
    if (!user) return notFound('존재하지 않는 유저')
    return HttpResponse.json(ok(toPublicUser(user)), { status: 200 })
  }),

  http.get(paths.users.portfolios(':userId'), ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const userId = Number(params.userId)
    if (!db.users.some((u) => u.id === userId)) return notFound('존재하지 않는 유저')

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const size = Number(url.searchParams.get('size') ?? 12)
    const content = db.portfolios
    const totalElements = content.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))

    return HttpResponse.json(ok({ content, page, size, totalElements, totalPages }), {
      status: 200,
    })
  }),

  http.get(paths.users.notificationSettings, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    return HttpResponse.json(ok(db.notificationSettings[user.id]), { status: 200 })
  }),

  http.patch(paths.users.notificationSettings, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as Partial<(typeof db.notificationSettings)[number]>
    db.notificationSettings[user.id] = {
      ...db.notificationSettings[user.id],
      ...body,
    }
    return HttpResponse.json(ok(db.notificationSettings[user.id]), { status: 200 })
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
]
