import type { Schedule, ScheduleScope } from '../types/schedule'

/** BE 캘린더/일별/생성 응답을 FE Schedule로 맞춤 (id ← scheduleId) */
export type BeScheduleLike = {
  scheduleId?: number
  id?: number
  scheduleScope: ScheduleScope
  projectId: number | null
  title: string
  startAt: string
  endAt: string
  location?: string | null
  publicMemo?: string | null
  privateMemo?: string | null
  participantIds?: number[]
  participants?: Array<{ userId: number }>
  createdAt?: string
  updatedAt?: string
}

export function normalizeSchedule(raw: BeScheduleLike, fallback?: Partial<Schedule>): Schedule {
  const id = raw.scheduleId ?? raw.id
  if (id == null) throw new Error('schedule id missing')

  const participantIds =
    raw.participantIds ?? raw.participants?.map((p) => p.userId) ?? fallback?.participantIds ?? []

  return {
    id,
    scheduleScope: raw.scheduleScope,
    projectId: raw.projectId,
    title: raw.title,
    startAt: raw.startAt,
    endAt: raw.endAt,
    location: raw.location ?? fallback?.location ?? null,
    publicMemo: raw.publicMemo ?? fallback?.publicMemo ?? null,
    privateMemo: raw.privateMemo ?? fallback?.privateMemo ?? null,
    participantIds,
    createdAt: raw.createdAt ?? fallback?.createdAt ?? raw.startAt,
    updatedAt: raw.updatedAt ?? fallback?.updatedAt ?? raw.endAt,
  }
}
