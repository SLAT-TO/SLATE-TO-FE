/** BE NotificationType.java와 정확히 일치시켜야 한다 — 여기 없는 값은 클릭해도 무반응으로 빠진다 */
export type NotificationType =
  | 'SCHEDULE_ASSIGNED'
  | 'PROJECT_JOINED'
  | 'VIDEO_FEEDBACK_COMMENTED'
  | 'RECRUITMENT_APPLIED'
  | 'SCHEDULE_CREATED'
  | 'NOTICE_CREATED'
  | 'FILE_UPLOADED'
  | 'DEADLINE_REMINDER'

/** BE NotificationSummary — targetType은 BE 스펙상 enum 미정의(자유 문자열) */
export type AppNotification = {
  notificationId: number
  projectId: number | null
  type: NotificationType
  title: string
  content: string
  /** 동일 건이 묶여 발송된 개수 — 1이면 단건 */
  groupCount: number
  targetType: string
  targetId: number
  isRead: boolean
  readAt: string | null
  createdAt: string
}

/** GET /api/v1/notifications/unread-count — BE 미구현, mock 전용 */
export type UnreadCountResult = {
  count: number
}
