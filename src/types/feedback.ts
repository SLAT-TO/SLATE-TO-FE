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
  timestampSec: number | null
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
  timestampSec?: number
}

export type UpdateFeedbackRequest = {
  content?: string
  timestampSec?: number
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
