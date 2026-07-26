export type NotificationType =
  | 'SCHEDULE_ASSIGNED'
  | 'PROJECT_INVITED'
  | 'VIDEO_FEEDBACK_COMMENTED'
  | 'RECRUITMENT_APPLIED'
  | 'DEADLINE_REMINDER'

/** BE NotificationSummary — targetType은 BE 스펙상 enum 미정의(자유 문자열) */
export type AppNotification = {
  notificationId: number
  projectId: number | null
  type: NotificationType
  content: string
  targetType: string
  targetId: number
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export type UnreadCountResult = {
  count: number
}
