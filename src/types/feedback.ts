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
  /** 해결 여부. BE·PATCH는 boolean. 목록 등에서 "Y"/"N"이 오면 api/normalize.toFeedbackStatus로 boolean화 */
  status: boolean
  createdAt: string
  updatedAt: string
}

export type FeedbackReply = {
  replyId: number
  feedbackId: number
  actor: FeedbackActor
  content: string
  /** FE mock 전용 — BE 답글 API는 시간 코드 미지원(Feedback과 달리). BE 연동 시 실제 지원 여부 재확인 필요 */
  startTime: number | null
  /** FE mock 전용 — BE 답글 API 미지원 */
  endTime: number | null
  /** 해결 여부. PATCH /replies/{replyId}/status 로 변경 */
  status: boolean
  createdAt: string
  updatedAt: string
}

export type CreateFeedbackRequest = {
  content: string
  /** 타임코드 시작 시간(초). endTime만 있고 startTime이 없으면 400 */
  startTime?: number
  /** 타임코드 종료 시간(초). 단일 시점이면 생략 */
  endTime?: number
  /** 공유링크 게스트 — 멤버는 JWT (FeedbackCreateReqDTO.guestId) */
  guestId?: number
}

export type UpdateFeedbackRequest = {
  content?: string
  startTime?: number
  endTime?: number
  guestId?: number
}

/** BE FeedbackStatusReqDTO */
export type UpdateFeedbackStatusRequest = {
  status: boolean
}

export type CreateReplyRequest = {
  content: string
  /** 공유링크 게스트 — 멤버는 JWT (ReplyCreateReqDTO.guestId) */
  guestId?: number
}

/** BE ReplyStatusReqDTO */
export type UpdateReplyStatusRequest = {
  status: boolean
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
  name: string
}

export type RegisterGuestResult = {
  guestId: number
  shareLinkId: number
  name: string
  createdAt: string
}
