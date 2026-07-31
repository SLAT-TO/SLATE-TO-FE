import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import { db, requireUser } from '../db'
import { ok } from '../response'
import { notFound, unauthorized } from '../errors'

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

export const notificationHandlers = [
  http.get(paths.notifications.root, ({ request }) => {
    if (!safeUser()) return unauthorized()

    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const size = Number(url.searchParams.get('size') ?? 20)

    const sorted = [...db.notifications].sort((a, b) => b.notificationId - a.notificationId)
    const filtered =
      cursor != null ? sorted.filter((n) => n.notificationId < Number(cursor)) : sorted
    const items = filtered.slice(0, size)
    const hasNext = filtered.length > size
    const nextCursor = hasNext && items.length > 0 ? items[items.length - 1]!.notificationId : null

    return HttpResponse.json(ok({ items, nextCursor, hasNext }), { status: 200 })
  }),

  // BE 미구현 — 안읽음 개수 API 없음 (목록 조회로 계산 필요)
  http.get(paths.notifications.unreadCount, () => {
    if (!safeUser()) return unauthorized()
    const count = db.notifications.filter((n) => !n.isRead).length
    return HttpResponse.json(ok({ count }), { status: 200 })
  }),

  http.patch(paths.notifications.read(':notificationId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const notification = db.notifications.find(
      (n) => n.notificationId === Number(params.notificationId),
    )
    if (!notification) return notFound()
    notification.isRead = true
    notification.readAt = new Date().toISOString()
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.patch(paths.notifications.readAll, () => {
    if (!safeUser()) return unauthorized()
    const now = new Date().toISOString()
    db.notifications.forEach((n) => {
      n.isRead = true
      n.readAt = n.readAt ?? now
    })
    return HttpResponse.json(ok(null), { status: 200 })
  }),
]
