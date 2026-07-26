import { request } from './client'
import { paths } from './paths'
import type { CursorPage } from '../types/project'
import type { AppNotification, UnreadCountResult } from '../types/notification'

export async function getNotifications(params?: {
  cursor?: number
  size?: number
}): Promise<CursorPage<AppNotification>> {
  return request({ method: 'GET', url: paths.notifications.root, params })
}

export async function getUnreadCount(): Promise<UnreadCountResult> {
  return request({ method: 'GET', url: paths.notifications.unreadCount })
}

export async function readNotification(notificationId: number): Promise<null> {
  return request({ method: 'PATCH', url: paths.notifications.read(notificationId) })
}

export async function readAllNotifications(): Promise<null> {
  return request({ method: 'PATCH', url: paths.notifications.readAll })
}
