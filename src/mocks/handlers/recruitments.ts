import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type { UserRegion } from '../../types/user'
import type {
  Application,
  CreateApplicationRequest,
  CreateRecruitmentRequest,
  Recruitment,
  RecruitmentApplication,
  UpdateApplicationRequest,
  UpdateRecruitmentRequest,
} from '../../types/recruitment'
import { allocId, db, requireUser, type MockRecruitmentRecord } from '../db'
import { badRequest, notFound, unauthorized } from '../errors'
import { created, ok } from '../response'

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

/** 요청 유저 기준으로 isBookmarked / isMine을 계산해 응답 형태로 변환 */
function toResponse(r: Recruitment, userId: number): Recruitment {
  return {
    ...r,
    isBookmarked: db.recruitmentBookmarks.some(
      (b) => b.userId === userId && b.recruitmentId === r.id,
    ),
    isMine: r.writer.id === userId,
  }
}

/** 커서 페이지네이션 응답 (mock은 전량 반환) */
function toPage(items: Recruitment[]) {
  return { items, nextCursor: null, hasNext: false }
}

export const recruitmentHandlers = [
  http.get(paths.recruitments.root, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const items = db.recruitments.map((r) => toResponse(r, user.id))
    return HttpResponse.json(ok(toPage(items)), { status: 200 })
  }),

  http.get(paths.recruitments.recommended, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const items = db.recruitments.slice(0, 6).map((r) => toResponse(r, user.id))
    return HttpResponse.json(ok(toPage(items)), { status: 200 })
  }),

  http.get(paths.recruitments.byId(':recruitmentId'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const recruitment = db.recruitments.find((r) => r.id === Number(params.recruitmentId))
    if (!recruitment) return notFound()
    recruitment.viewCount += 1

    const applications = db.applications.filter((a) => a.recruitmentId === recruitment.id)
    const mine = applications.find((a) => a.userId === user.id)

    return HttpResponse.json(
      ok({
        ...toResponse(recruitment, user.id),
        applicantCount: applications.length,
        hasApplied: Boolean(mine),
        myApplicationStatus: mine?.status ?? null,
      }),
      { status: 200 },
    )
  }),

  http.post(paths.recruitments.root, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as CreateRecruitmentRequest
    if (!body.title) return badRequest()
    const now = new Date().toISOString()
    const recruitment: MockRecruitmentRecord = {
      id: allocId(),
      title: body.title,
      category: body.category,
      lengthType: body.lengthType ?? null,
      recruitPart: body.recruitPart,
      location: body.location,
      pay: body.pay ?? '협의',
      deadline: body.deadline,
      dday: 30,
      status: 'RECRUITING',
      viewCount: 0,
      isBookmarked: false,
      isMine: true,
      writer: {
        id: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        primaryRole: user.primaryRole,
        locations: user.location ? ([user.location] as UserRegion[]) : [],
      },
      description: body.description,
      shootingPeriod: '',
      contact: '',
      createdAt: now,
      updatedAt: now,
    }
    db.recruitments.unshift(recruitment)
    return HttpResponse.json(created(recruitment), { status: 201 })
  }),

  http.patch(paths.recruitments.byId(':recruitmentId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const recruitment = db.recruitments.find((r) => r.id === Number(params.recruitmentId))
    if (!recruitment) return notFound()
    const body = (await request.json()) as UpdateRecruitmentRequest
    Object.assign(recruitment, body)
    return HttpResponse.json(ok(toResponse(recruitment, user.id)), { status: 200 })
  }),

  http.delete(paths.recruitments.byId(':recruitmentId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.recruitmentId)
    if (!db.recruitments.some((r) => r.id === id)) return notFound()
    db.recruitments = db.recruitments.filter((r) => r.id !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.get(paths.users.myRecruitments, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const items = db.recruitments
      .filter((r) => r.writer.id === user.id)
      .map((r) => toResponse(r, user.id))
    return HttpResponse.json(ok(toPage(items)), { status: 200 })
  }),

  http.get(paths.users.myApplications, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const items = db.applications.filter((a) => a.userId === user.id)
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.get(paths.users.myRecruitmentBookmarks, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const ids = db.recruitmentBookmarks
      .filter((b) => b.userId === user.id)
      .map((b) => b.recruitmentId)
    const items = db.recruitments
      .filter((r) => ids.includes(r.id))
      .map((r) => toResponse(r, user.id))
    return HttpResponse.json(ok(toPage(items)), { status: 200 })
  }),

  http.post(paths.recruitments.bookmark(':recruitmentId'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const recruitmentId = Number(params.recruitmentId)
    if (!db.recruitments.some((r) => r.id === recruitmentId)) return notFound()
    if (
      !db.recruitmentBookmarks.some(
        (b) => b.userId === user.id && b.recruitmentId === recruitmentId,
      )
    ) {
      db.recruitmentBookmarks.push({ userId: user.id, recruitmentId })
    }
    return HttpResponse.json(ok({ bookmarked: true }), { status: 200 })
  }),

  http.delete(paths.recruitments.bookmark(':recruitmentId'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const recruitmentId = Number(params.recruitmentId)
    db.recruitmentBookmarks = db.recruitmentBookmarks.filter(
      (b) => !(b.userId === user.id && b.recruitmentId === recruitmentId),
    )
    return HttpResponse.json(ok({ bookmarked: false }), { status: 200 })
  }),

  http.post(paths.recruitments.applications(':recruitmentId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const recruitmentId = Number(params.recruitmentId)
    const recruitment = db.recruitments.find((r) => r.id === recruitmentId)
    if (!recruitment) return notFound()
    const body = (await request.json()) as CreateApplicationRequest
    const application: Application = {
      id: allocId(),
      recruitmentId,
      userId: user.id,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      message: body.message ?? null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    db.applications.push(application)
    return HttpResponse.json(created(application), { status: 201 })
  }),

  http.get(paths.recruitments.applications(':recruitmentId'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()

    const items: RecruitmentApplication[] = db.applications
      .filter((a) => a.recruitmentId === Number(params.recruitmentId))
      .map((a) => ({
        applicationId: a.id,
        applicationStatus: a.status,
        message: a.message ?? '',
        referenceLink: null,
        appliedAt: a.createdAt,
        applicant: {
          id: a.userId,
          nickname: a.nickname,
          profileImageUrl: a.profileImageUrl,
          bio: '자기소개 미리보기 멘트가 나오게 됩니다.',
          primaryRole: user.primaryRole,
          locations: [],
        },
      }))

    return HttpResponse.json(ok({ items, nextCursor: null, hasNext: false }), { status: 200 })
  }),

  http.patch(
    paths.recruitments.application(':recruitmentId', ':applicationId'),
    async ({ request, params }) => {
      if (!safeUser()) return unauthorized()
      const application = db.applications.find((a) => a.id === Number(params.applicationId))
      if (!application) return notFound()
      const body = (await request.json()) as UpdateApplicationRequest
      application.status = body.status
      return HttpResponse.json(ok(application), { status: 200 })
    },
  ),
]
