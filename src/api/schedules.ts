import { request } from './client'
import { paths } from './paths'
import { normalizeSchedule, type BeScheduleLike } from './scheduleNormalize'
import type {
  CreateScheduleRequest,
  PrivateMemoRequest,
  Schedule,
  ScheduleDailyItem,
  ScheduleScope,
  ScheduleSummaryItem,
  TodayBriefing,
  UpdateScheduleRequest,
} from '../types/schedule'

function monthRangeIso(anchor: Date): { startAt: string; endAt: string } {
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  const start = new Date(y, m, 1, 0, 0, 0)
  const end = new Date(y, m + 1, 0, 23, 59, 59)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return { startAt: fmt(start), endAt: fmt(end) }
}

export async function getTodayBriefing(): Promise<TodayBriefing> {
  return request({ method: 'GET', url: paths.briefings.today })
}

/** FE mock 전용 path — BE 미구현 */
export async function getScheduleSummary(): Promise<{ items: ScheduleSummaryItem[] }> {
  return request({ method: 'GET', url: paths.schedules.summary })
}

/** BE GET /schedules — startAt/endAt 필수, scope·projectId 선택 */
export async function getSchedules(options?: {
  projectId?: number
  scope?: ScheduleScope | 'ALL'
  startAt?: string
  endAt?: string
  /** startAt/endAt 생략 시 이 달 기준으로 캘린더 조회 */
  month?: Date
}): Promise<{ items: Schedule[] }> {
  const range =
    options?.startAt && options?.endAt
      ? { startAt: options.startAt, endAt: options.endAt }
      : monthRangeIso(options?.month ?? new Date())

  const result = await request<{ items: BeScheduleLike[] }>({
    method: 'GET',
    url: paths.schedules.root,
    params: {
      startAt: range.startAt,
      endAt: range.endAt,
      scope: options?.scope ?? (options?.projectId != null ? 'PROJECT' : 'ALL'),
      ...(options?.projectId != null ? { projectId: options.projectId } : {}),
    },
  })
  return { items: result.items.map((item) => normalizeSchedule(item)) }
}

/** 프로젝트 일정 탭/대시보드 — BE 캘린더 API (중첩 /projects/:id/schedules 아님) */
export async function getProjectSchedules(
  projectId: number,
  month?: Date,
): Promise<{ items: Schedule[] }> {
  return getSchedules({ projectId, scope: 'PROJECT', month: month ?? new Date() })
}

/** BE GET /schedules/daily — 대상자(participants/participantSummary)·메모·수정 가능 여부(canEdit)까지 포함된 응답 그대로 반환 */
export async function getDailySchedules(
  date: string,
  options?: { projectId?: number; scope?: ScheduleScope | 'ALL' },
): Promise<{ date: string; items: ScheduleDailyItem[] }> {
  return request({
    method: 'GET',
    url: paths.schedules.daily,
    params: {
      date,
      scope: options?.scope ?? (options?.projectId != null ? 'PROJECT' : 'ALL'),
      ...(options?.projectId != null ? { projectId: options.projectId } : {}),
    },
  })
}

export async function createSchedule(body: CreateScheduleRequest): Promise<Schedule> {
  const result = await request<BeScheduleLike>({
    method: 'POST',
    url: paths.schedules.root,
    data: body,
  })
  return normalizeSchedule(result, {
    location: body.location ?? null,
    publicMemo: body.publicMemo ?? null,
    privateMemo: null,
    participantIds: body.participantIds ?? [],
  })
}

export async function updateSchedule(
  scheduleId: number,
  body: UpdateScheduleRequest,
  current?: Schedule,
): Promise<Schedule> {
  const result = await request<BeScheduleLike>({
    method: 'PATCH',
    url: paths.schedules.byId(scheduleId),
    data: body,
  })
  return normalizeSchedule(result, {
    location: body.location ?? current?.location ?? null,
    publicMemo: body.publicMemo ?? current?.publicMemo ?? null,
    privateMemo: current?.privateMemo ?? null,
    participantIds: body.participantIds ?? current?.participantIds ?? [],
    createdAt: current?.createdAt,
  })
}

export async function deleteSchedule(scheduleId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.schedules.byId(scheduleId) })
}

/** BE PATCH body: { content } — 응답은 privateMemo로 병합해 Schedule 형태 유지 */
export async function updatePrivateMemo(
  scheduleId: number,
  body: PrivateMemoRequest,
  current?: Schedule,
): Promise<Schedule> {
  const result = await request<{
    privateMemoId: number
    scheduleId: number
    content: string
    updatedAt: string
  }>({
    method: 'PATCH',
    url: paths.schedules.privateMemo(scheduleId),
    data: body,
  })
  if (current) {
    return {
      ...current,
      privateMemo: result.content,
      updatedAt: result.updatedAt,
    }
  }
  return normalizeSchedule({
    scheduleId: result.scheduleId,
    scheduleScope: 'PROJECT',
    projectId: null,
    title: '',
    startAt: result.updatedAt,
    endAt: result.updatedAt,
    privateMemo: result.content,
    updatedAt: result.updatedAt,
  })
}
