export type FeedbackStatus = 'OPEN' | 'RESOLVED' | string
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
  status: FeedbackStatus
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
  status: FeedbackStatus
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
