import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type {
  CreateApplicationRequest,
  CreateRecruitmentRequest,
  UpdateApplicationRequest,
  UpdateRecruitmentRequest,
} from '../../types/recruitment'
import { allocId, db, requireUser } from '../db'
import { badRequest, notFound, unauthorized } from '../errors'
import { created, ok } from '../response'

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

export const recruitmentHandlers = [
  http.get(paths.recruitments.root, () => {
    if (!safeUser()) return unauthorized()
    return HttpResponse.json(ok({ content: db.recruitments }), { status: 200 })
  }),

  http.get(paths.recruitments.recommended, () => {
    if (!safeUser()) return unauthorized()
    return HttpResponse.json(ok({ content: db.recruitments.slice(0, 3) }), { status: 200 })
  }),

  http.get(paths.recruitments.byId(':recruitmentId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const recruitment = db.recruitments.find((r) => r.id === Number(params.recruitmentId))
    if (!recruitment) return notFound()
    recruitment.viewCount += 1
    return HttpResponse.json(ok(recruitment), { status: 200 })
  }),

  http.post(paths.recruitments.root, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as CreateRecruitmentRequest
    if (!body.title || !body.description) return badRequest()
    const now = new Date().toISOString()
    const recruitment = {
      id: allocId(),
      title: body.title,
      description: body.description,
      roles: body.roles ?? [],
      categories: body.categories ?? [],
      regions: body.regions ?? [],
      status: 'OPEN',
      viewCount: 0,
      bookmarkCount: 0,
      applicationCount: 0,
      authorId: user.id,
      authorNickname: user.nickname,
      createdAt: now,
      updatedAt: now,
    }
    db.recruitments.unshift(recruitment)
    return HttpResponse.json(created(recruitment), { status: 201 })
  }),

  http.patch(paths.recruitments.byId(':recruitmentId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const recruitment = db.recruitments.find((r) => r.id === Number(params.recruitmentId))
    if (!recruitment) return notFound()
    const body = (await request.json()) as UpdateRecruitmentRequest
    Object.assign(recruitment, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(ok(recruitment), { status: 200 })
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
    const content = db.recruitments.filter((r) => r.authorId === user.id)
    return HttpResponse.json(ok({ content }), { status: 200 })
  }),

  http.get(paths.users.myApplications, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const content = db.applications.filter((a) => a.userId === user.id)
    return HttpResponse.json(ok({ content }), { status: 200 })
  }),

  http.get(paths.users.myRecruitmentBookmarks, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const ids = db.recruitmentBookmarks
      .filter((b) => b.userId === user.id)
      .map((b) => b.recruitmentId)
    const content = db.recruitments.filter((r) => ids.includes(r.id))
    return HttpResponse.json(ok({ content }), { status: 200 })
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
      const recruitment = db.recruitments.find((r) => r.id === recruitmentId)
      if (recruitment) recruitment.bookmarkCount += 1
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
    const recruitment = db.recruitments.find((r) => r.id === recruitmentId)
    if (recruitment && recruitment.bookmarkCount > 0) recruitment.bookmarkCount -= 1
    return HttpResponse.json(ok({ bookmarked: false }), { status: 200 })
  }),

  http.post(paths.recruitments.applications(':recruitmentId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const recruitmentId = Number(params.recruitmentId)
    const recruitment = db.recruitments.find((r) => r.id === recruitmentId)
    if (!recruitment) return notFound()
    const body = (await request.json()) as CreateApplicationRequest
    const application = {
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
    recruitment.applicationCount += 1
    return HttpResponse.json(created(application), { status: 201 })
  }),

  http.get(paths.recruitments.applications(':recruitmentId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const content = db.applications.filter((a) => a.recruitmentId === Number(params.recruitmentId))
    return HttpResponse.json(ok({ content }), { status: 200 })
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
