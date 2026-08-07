import { request } from '../../api/client'
import { getMe } from '../../api/users'
import { paths } from '../../api/paths'
import { normalizeSchedule, type BeScheduleLike } from '../../api/scheduleNormalize'
import type {
  CreateScheduleRequest,
  PrivateMemoRequest,
  Schedule,
  ScheduleScope,
  UpdateScheduleRequest,
} from '../../types/schedule'

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

/** BE ScheduleController — JWT가 아니라 X-USER-ID 헤더 */
async function scheduleHeaders(): Promise<Record<string, string>> {
  const me = await getMe()
  return { 'X-USER-ID': String(me.id) }
}

function scheduleItems(result: {
  items?: BeScheduleLike[]
  schedules?: BeScheduleLike[]
}): BeScheduleLike[] {
  return result.items ?? result.schedules ?? []
}

/** 워크스페이스 전용 일정 API (공용 `api/schedules`는 캘린더·홈과 공유되므로 건드리지 않음) */
export async function getWorkspaceProjectSchedules(
  projectId: number,
  month?: Date,
): Promise<{ items: Schedule[] }> {
  const range = monthRangeIso(month ?? new Date())
  const result = await request<{ items?: BeScheduleLike[]; schedules?: BeScheduleLike[] }>({
    method: 'GET',
    url: paths.schedules.root,
    headers: await scheduleHeaders(),
    params: {
      startAt: range.startAt,
      endAt: range.endAt,
      scope: 'PROJECT',
      projectId,
    },
  })
  return { items: scheduleItems(result).map((item) => normalizeSchedule(item)) }
}

export async function getWorkspaceDailySchedules(
  date: string,
  options?: { projectId?: number; scope?: ScheduleScope | 'ALL' },
): Promise<{ date: string; items: Schedule[] }> {
  const result = await request<{
    date: string
    items?: BeScheduleLike[]
    schedules?: BeScheduleLike[]
  }>({
    method: 'GET',
    url: paths.schedules.daily,
    headers: await scheduleHeaders(),
    params: {
      date,
      scope: options?.scope ?? (options?.projectId != null ? 'PROJECT' : 'ALL'),
      ...(options?.projectId != null ? { projectId: options.projectId } : {}),
    },
  })
  return { date: result.date, items: scheduleItems(result).map((item) => normalizeSchedule(item)) }
}

export async function createWorkspaceSchedule(body: CreateScheduleRequest): Promise<Schedule> {
  const result = await request<BeScheduleLike>({
    method: 'POST',
    url: paths.schedules.root,
    headers: await scheduleHeaders(),
    data: body,
  })
  return normalizeSchedule(result, {
    location: body.location ?? null,
    publicMemo: body.publicMemo ?? null,
    privateMemo: null,
    participantIds: body.participantIds ?? [],
  })
}

export async function updateWorkspaceSchedule(
  scheduleId: number,
  body: UpdateScheduleRequest,
  current?: Schedule,
): Promise<Schedule> {
  const result = await request<BeScheduleLike>({
    method: 'PATCH',
    url: paths.schedules.byId(scheduleId),
    headers: await scheduleHeaders(),
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

export async function deleteWorkspaceSchedule(scheduleId: number): Promise<null> {
  return request({
    method: 'DELETE',
    url: paths.schedules.byId(scheduleId),
    headers: await scheduleHeaders(),
  })
}

export async function updateWorkspacePrivateMemo(
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
    headers: await scheduleHeaders(),
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
