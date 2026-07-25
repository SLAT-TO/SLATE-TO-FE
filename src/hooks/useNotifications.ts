import { useEffect, useState } from 'react'
import { getNotifications, readAllNotifications, readNotification } from '../api/notifications'
import { ApiError } from '../types/api'
import type { AppNotification } from '../types/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getNotifications()
        if (!cancelled) setNotifications(result.items)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '알림을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function markAsRead(notificationId: number) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    )
    try {
      await readNotification(notificationId)
    } catch {
      // 낙관적 업데이트 유지 — 재조회 시 서버 상태로 정정됨
    }
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    try {
      await readAllNotifications()
    } catch {
      // 낙관적 업데이트 유지 — 재조회 시 서버 상태로 정정됨
    }
  }

  return { notifications, loading, error, markAsRead, markAllAsRead }
}
