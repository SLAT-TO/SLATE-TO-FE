export type Schedule = {
  id: number
  projectId: number
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

export type ScheduleSummaryItem = {
  date: string
  count: number
}

export type CreateScheduleRequest = {
  projectId: number
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
