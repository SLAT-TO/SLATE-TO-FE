import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { getNotifications, readAllNotifications, readNotification } from '../api/notifications'
import type { CursorPage } from '../types/project'
import type { AppNotification } from '../types/notification'
import { notificationKeys } from './keys'

export function useNotificationsQuery() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    initialPageParam: null as number | null,
    queryFn: ({ pageParam }) => getNotifications({ cursor: pageParam ?? undefined, size: 20 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.nextCursor == null) return undefined
      return lastPage.nextCursor
    },
  })
}

function markRead(items: AppNotification[], notificationId?: number): AppNotification[] {
  return items.map((item) =>
    notificationId == null || item.notificationId === notificationId
      ? { ...item, isRead: true }
      : item,
  )
}

/** InfiniteData 전체 페이지를 순회하며 페이지별 items에 markRead를 적용 */
function markReadInCache(
  prev: InfiniteData<CursorPage<AppNotification>> | undefined,
  notificationId?: number,
): InfiniteData<CursorPage<AppNotification>> | undefined {
  if (!prev) return prev
  return {
    ...prev,
    pages: prev.pages.map((page) => ({
      ...page,
      items: markRead(page.items, notificationId),
    })),
  }
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() })
      const previous = queryClient.getQueryData<InfiniteData<CursorPage<AppNotification>>>(
        notificationKeys.list(),
      )
      queryClient.setQueryData<InfiniteData<CursorPage<AppNotification>>>(
        notificationKeys.list(),
        (prev) => markReadInCache(prev, notificationId),
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
      const previous = queryClient.getQueryData<InfiniteData<CursorPage<AppNotification>>>(
        notificationKeys.list(),
      )
      queryClient.setQueryData<InfiniteData<CursorPage<AppNotification>>>(
        notificationKeys.list(),
        (prev) => markReadInCache(prev),
      )
      return { previous }
    },
  })
}
