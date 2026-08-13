import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, readAllNotifications, readNotification } from '../api/notifications'
import type { AppNotification } from '../types/notification'
import { notificationKeys } from './keys'

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const result = await getNotifications()
      return result.items
    },
  })
}

function markRead(
  data: AppNotification[] | undefined,
  notificationId?: number,
): AppNotification[] | undefined {
  if (!data) return data
  return data.map((item) =>
    notificationId == null || item.notificationId === notificationId
      ? { ...item, isRead: true }
      : item,
  )
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() })
      const previous = queryClient.getQueryData<AppNotification[]>(notificationKeys.list())
      queryClient.setQueryData<AppNotification[]>(notificationKeys.list(), (prev) =>
        markRead(prev, notificationId),
      )
      return { previous }
    },
    // 낙관적 업데이트 유지 — 실패해도 롤백하지 않고 다음 재조회 시 서버 상태로 정정됨
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => readAllNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() })
      const previous = queryClient.getQueryData<AppNotification[]>(notificationKeys.list())
      queryClient.setQueryData<AppNotification[]>(notificationKeys.list(), (prev) => markRead(prev))
      return { previous }
    },
  })
}
