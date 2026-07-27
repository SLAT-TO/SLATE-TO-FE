export type ScheduleScope = 'PERSONAL' | 'PROJECT'

export type Schedule = {
  id: number
  scheduleScope: ScheduleScope
  projectId: number | null
  title: string
  startAt: string
  endAt: string
  location: string | null
  publicMemo: string | null
  privateMemo: string | null
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

export type PrivateMemoRequest = {
  privateMemo: string
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
