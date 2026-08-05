import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type {
  CreateScheduleRequest,
  PrivateMemoRequest,
  UpdateScheduleRequest,
} from '../../types/schedule'
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

/** 홈 화면에 노출할 오늘의 브리핑 개수 */
const BRIEFING_LIMIT = 3

export const scheduleHandlers = [
  // 일정(오늘) + 최근 안 읽은 알림을 조합해 최대 3건 반환
  http.get(paths.briefings.today, () => {
    if (!safeUser()) return unauthorized()

    const todayKey = new Date().toISOString().slice(0, 10)

    const scheduleItems = db.schedules
      .filter((s) => s.startAt.slice(0, 10) === todayKey)
      .map((s) => ({
        type: 'TODAY_SCHEDULE',
        content: `오늘 [${s.title}] 일정이 있어요`,
        priority: 1,
        projectId: s.projectId,
        targetType: 'SCHEDULE',
        targetId: s.id,
        occurredAt: s.startAt,
      }))

    const notificationItems = [...db.notifications]
      .filter((n) => !n.isRead)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((n) => ({
        type: 'NOTIFICATION',
        content: n.content,
        priority: 2,
        projectId: n.projectId,
        targetType: n.targetType,
        targetId: n.targetId,
        occurredAt: n.createdAt,
      }))

    return HttpResponse.json(
      ok({ items: [...scheduleItems, ...notificationItems].slice(0, BRIEFING_LIMIT) }),
      { status: 200 },
    )
  }),

  // BE 미구현 — 일정 요약 API 없음
  http.get(paths.schedules.summary, () => {
    if (!safeUser()) return unauthorized()
    const summary = db.schedules.map((s) => ({
      date: s.startAt.slice(0, 10),
      count: 1,
    }))
    return HttpResponse.json(ok({ items: summary }), { status: 200 })
  }),

  http.get(paths.schedules.root, ({ request }) => {
    if (!safeUser()) return unauthorized()
    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')
    const items = projectId
      ? db.schedules.filter((s) => s.projectId === Number(projectId))
      : db.schedules
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  // BE 미구현 — 프로젝트별 하위 일정 API 없음 (최상위 /schedules만 존재)
  http.get(paths.projects.schedules(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const items = db.schedules.filter((s) => s.projectId === Number(params.projectId))
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.get(paths.schedules.daily, ({ request }) => {
    if (!safeUser()) return unauthorized()
    const date = new URL(request.url).searchParams.get('date')
    const items = date ? db.schedules.filter((s) => s.startAt.startsWith(date)) : db.schedules
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.post(paths.schedules.root, async ({ request }) => {
    if (!safeUser()) return unauthorized()
    const body = (await request.json()) as CreateScheduleRequest
    if (!body.scheduleScope || !body.title || !body.startAt || !body.endAt) return badRequest()
    if (body.scheduleScope === 'PROJECT' && !body.projectId) return badRequest()
    const now = new Date().toISOString()
    const schedule = {
      id: allocId(),
      scheduleScope: body.scheduleScope,
      projectId: body.scheduleScope === 'PROJECT' ? (body.projectId ?? null) : null,
      title: body.title,
      startAt: body.startAt,
      endAt: body.endAt,
      location: body.location ?? null,
      publicMemo: body.publicMemo ?? null,
      privateMemo: null,
      participantIds: body.participantIds ?? [],
      createdAt: now,
      updatedAt: now,
    }
    db.schedules.unshift(schedule)
    return HttpResponse.json(created(schedule), { status: 201 })
  }),

  http.patch(paths.schedules.byId(':scheduleId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const schedule = db.schedules.find((s) => s.id === Number(params.scheduleId))
    if (!schedule) return notFound()
    const body = (await request.json()) as UpdateScheduleRequest
    Object.assign(schedule, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(ok(schedule), { status: 200 })
  }),

  http.delete(paths.schedules.byId(':scheduleId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.scheduleId)
    if (!db.schedules.some((s) => s.id === id)) return notFound()
    db.schedules = db.schedules.filter((s) => s.id !== id)
    return HttpResponse.json(ok({ deletedAt: new Date().toISOString() }), { status: 200 })
  }),

  http.get(paths.projects.scheduleCandidates(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
    const items = db.members.map((m) => ({
      memberId: m.memberId,
      userId: m.userId,
      nickname: m.nickname,
      profileImageUrl: m.profileImageUrl,
      roleNames: m.roleNames,
    }))
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.patch(paths.schedules.privateMemo(':scheduleId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const schedule = db.schedules.find((s) => s.id === Number(params.scheduleId))
    if (!schedule) return notFound()
    const body = (await request.json()) as PrivateMemoRequest
    schedule.privateMemo = body.privateMemo
    schedule.updatedAt = new Date().toISOString()
    return HttpResponse.json(ok(schedule), { status: 200 })
  }),
]
