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

/** BE FeedbackListItemDTO — 목록 조회에서만 답글 개수를 함께 준다.
 * 작성/수정/상태변경 응답(Feedback)에는 없다. */
export type FeedbackListEntry = Feedback & {
  replyCount: number
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
}

export type UpdateFeedbackRequest = {
  content?: string
  startTime?: number
  endTime?: number
}

/** BE FeedbackStatusReqDTO */
export type UpdateFeedbackStatusRequest = {
  status: boolean
}

export type CreateReplyRequest = {
  content: string
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
  /** 이 링크로 참여한 게스트 수 */
  guestCount: number
}

/** BE GuestSummaryResDTO — 소유자용 게스트 목록의 항목. 세션 토큰 등 민감 정보는 없음 */
export type GuestSummary = {
  guestId: number
  name: string
  createdAt: string
}

/** BE GuestListResDTO */
export type GuestListResult = {
  guestCount: number
  guests: GuestSummary[]
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
  /** 게스트 요청의 X-Guest-Token 헤더에 전달하는 일회성 세션 토큰 */
  sessionToken: string
  createdAt: string
}
