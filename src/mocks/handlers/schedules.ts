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
function toBeSchedule(s: (typeof db.schedules)[number]) {
  return {
    scheduleId: s.id,
    scheduleScope: s.scheduleScope,
    projectId: s.projectId,
    title: s.title,
    startAt: s.startAt,
    endAt: s.endAt,
    location: s.location,
    publicMemo: s.publicMemo,
    privateMemo: s.privateMemo,
    participants: s.participantIds.map((userId) => {
      const member = db.members.find((m) => m.userId === userId)
      return {
        userId,
        nickname: member?.nickname ?? `user-${userId}`,
        profileImageUrl: member?.profileImageUrl ?? null,
      }
    }),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}

export const scheduleHandlers = [
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
    const scope = url.searchParams.get('scope')
    let items = db.schedules
    if (projectId) items = items.filter((s) => s.projectId === Number(projectId))
    if (scope === 'PROJECT') items = items.filter((s) => s.scheduleScope === 'PROJECT')
    if (scope === 'PERSONAL') items = items.filter((s) => s.scheduleScope === 'PERSONAL')
    return HttpResponse.json(ok({ items: items.map((s) => toBeSchedule(s)) }), { status: 200 })
  }),

  http.get(paths.schedules.daily, ({ request }) => {
    if (!safeUser()) return unauthorized()
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const projectId = url.searchParams.get('projectId')
    const scope = url.searchParams.get('scope')
    if (!date) return badRequest()
    let items = db.schedules.filter(
      (s) => s.startAt.slice(0, 10) <= date && s.endAt.slice(0, 10) >= date,
    )
    if (projectId) items = items.filter((s) => s.projectId === Number(projectId))
    if (scope === 'PROJECT') items = items.filter((s) => s.scheduleScope === 'PROJECT')
    return HttpResponse.json(ok({ date, items: items.map((s) => toBeSchedule(s)) }), {
      status: 200,
    })
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
    return HttpResponse.json(
      created({
        scheduleId: schedule.id,
        scheduleScope: schedule.scheduleScope,
        projectId: schedule.projectId,
        title: schedule.title,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      }),
      { status: 201 },
    )
  }),

  http.patch(paths.schedules.byId(':scheduleId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const schedule = db.schedules.find((s) => s.id === Number(params.scheduleId))
    if (!schedule) return notFound()
    const body = (await request.json()) as UpdateScheduleRequest
    Object.assign(schedule, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(
      ok({
        scheduleId: schedule.id,
        scheduleScope: schedule.scheduleScope,
        projectId: schedule.projectId,
        title: schedule.title,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      }),
      { status: 200 },
    )
  }),

  http.delete(paths.schedules.byId(':scheduleId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.scheduleId)
    if (!db.schedules.some((s) => s.id === id)) return notFound()
    db.schedules = db.schedules.filter((s) => s.id !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.patch(paths.schedules.privateMemo(':scheduleId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const schedule = db.schedules.find((s) => s.id === Number(params.scheduleId))
    if (!schedule) return notFound()
    const body = (await request.json()) as PrivateMemoRequest
    if (!body.content?.trim()) return badRequest()
    schedule.privateMemo = body.content
    schedule.updatedAt = new Date().toISOString()
    return HttpResponse.json(
      ok({
        privateMemoId: schedule.id,
        scheduleId: schedule.id,
        content: body.content,
        updatedAt: schedule.updatedAt,
      }),
      { status: 200 },
    )
  }),
]
