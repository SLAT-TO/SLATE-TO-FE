export type ScheduleScope = 'PERSONAL' | 'PROJECT'

export type Schedule = {
  /** BE scheduleId */
  id: number
  scheduleScope: ScheduleScope
  projectId: number | null
  title: string
  startAt: string
  endAt: string
  location: string | null
  publicMemo: string | null
  privateMemo: string | null
  /** BE participant userId 목록 (memberId 아님) */
  participantIds: number[]
  createdAt: string
  updatedAt: string
}

/** GET /api/v1/schedules/summary — BE 미구현, mock 전용 */
export type ScheduleSummaryItem = {
  date: string
  count: number
}

export type CreateScheduleRequest = {
  scheduleScope: ScheduleScope
  /** scheduleScope가 PROJECT일 때 필수 */
  projectId?: number
  title: string
  startAt: string
  endAt: string
  location?: string
  publicMemo?: string
  participantIds?: number[]
}

export type UpdateScheduleRequest = Partial<Omit<CreateScheduleRequest, 'projectId'>>

/** BE SchedulePrivateMemoRequest */
export type PrivateMemoRequest = {
  content: string
}

/** BE BriefingItem — type/targetType은 BE 스펙상 enum 미정의(자유 문자열) */
export type BriefingItem = {
  type: string
  content: string
  priority: number
  projectId: number | null
  targetType: string
  targetId: number
  occurredAt: string
}

/** GET /api/v1/briefings/today — 오늘의 브리핑(일정+최근 주요 알림 조합, 최대 3건) */
export type TodayBriefing = {
  items: BriefingItem[]
}

export type ScheduleParticipantCandidate = {
  memberId: number
  userId: number
  name: string
  profileImageUrl: string | null
  jobRole: string
}
