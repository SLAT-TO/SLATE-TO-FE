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

/** GET /api/v1/briefings/today — BE 미구현, 엔티티/컨트롤러 자체가 없음. mock 전용 */
export type TodayBriefing = {
  date: string
  scheduleCount: number
  unreadNotificationCount: number
  activeProjectCount: number
  items: Array<{
    type: string
    title: string
    projectId?: number
    scheduleId?: number
  }>
}

export type ScheduleParticipantCandidate = {
  memberId: number
  userId: number
  name: string
  profileImageUrl: string | null
  jobRole: string
}

export type ScheduleDailyParticipant = {
  userId: number
  nickname: string
  profileImageUrl: string | null
}

/** GET /api/v1/schedules/daily 항목 — 요약(getSchedules)과 달리 대상자/메모/수정 가능 여부까지 포함 */
export type ScheduleDailyItem = {
  scheduleId: number
  scheduleScope: ScheduleScope
  projectId: number | null
  projectTitle: string | null
  title: string
  startAt: string
  endAt: string
  location: string | null
  participants: ScheduleDailyParticipant[]
  participantSummary: string | null
  publicMemo: string | null
  privateMemo: string | null
  canEdit: boolean
}
