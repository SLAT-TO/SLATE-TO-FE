import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../queries/notifications'
import { ApiError } from '../types/api'

export function useNotifications() {
  const notificationsQuery = useNotificationsQuery()
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const error = notificationsQuery.isError
    ? notificationsQuery.error instanceof ApiError
      ? notificationsQuery.error.message
      : '알림을 불러오지 못했습니다.'
    : null

  async function markAsRead(notificationId: number) {
    await markReadMutation.mutateAsync(notificationId)
  }

  async function markAllAsRead() {
    await markAllReadMutation.mutateAsync()
  }

  return {
    notifications: notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    loading: notificationsQuery.isPending,
    error,
    markAsRead,
    markAllAsRead,
    hasNextPage: notificationsQuery.hasNextPage,
    fetchNextPage: notificationsQuery.fetchNextPage,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
  }
}
