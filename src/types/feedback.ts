export type FeedbackActorType = 'USER' | 'GUEST'

export type FeedbackActor = {
  type: FeedbackActorType
  id: number
  name: string
}

export type Feedback = {
  feedbackId: number
  videoId: number
  actor: FeedbackActor
  content: string
  /** 타임코드 시작 시간(초). 없으면 null */
  startTime: number | null
  /** 타임코드 종료 시간(초). 단일 시점이면 null, startTime 없이는 값 가질 수 없음 */
  endTime: number | null
  /** 해결 여부. "피드백 해결 상태 변경" API 스펙(boolean) 기준 — 목록 조회 API는 문자열(Y/N)로 명세돼 있어 실제 연동 시 재확인 필요 */
  status: boolean
  createdAt: string
  updatedAt: string
}

export type FeedbackReply = {
  replyId: number
  feedbackId: number
  actor: FeedbackActor
  content: string
  createdAt: string
  updatedAt: string
}

export type CreateFeedbackRequest = {
  content: string
  /** 타임코드 시작 시간(초). endTime만 있고 startTime이 없으면 400 */
  startTime?: number
  /** 타임코드 종료 시간(초). 단일 시점이면 생략 */
  endTime?: number
}

export type UpdateFeedbackRequest = {
  content?: string
  startTime?: number
  endTime?: number
}

export type UpdateFeedbackStatusRequest = {
  status: boolean
}

export type CreateReplyRequest = {
  content: string
}

export type ShareLink = {
  shareLinkId: number
  videoId: number
  token: string
  isActive: boolean
  expiredAt: string | null
  createdAt: string
}

export type ShareLinkAccess = {
  videoId: number
  videoTitle: string
  requiresNickname: boolean
}

export type RegisterGuestRequest = {
  nickname: string
}
