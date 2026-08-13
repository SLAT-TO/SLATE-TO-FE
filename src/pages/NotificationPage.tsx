import { Button } from '../components/Button'
import { useNotifications } from '../hooks/useNotifications'
import type { AppNotification } from '../types/notification'
import { navigate } from '../utils/navigation'

const CARD_SHADOW = 'shadow-(--shadow-card)'

function ChevronLeftIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NotificationCard({
  notification,
  onClick,
}: {
  notification: AppNotification
  onClick: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`relative flex w-full flex-col items-start justify-between gap-3 rounded-[10.242px] px-6 py-4 text-left ${CARD_SHADOW} ${
          notification.isRead ? 'bg-neutral-3' : 'bg-neutral-1'
        }`}
      >
        {!notification.isRead && (
          <span
            className="bg-warning absolute top-4 right-6 size-2.75 shrink-0 rounded-full"
            aria-hidden
          />
        )}
        <span className="text-body-sm text-neutral-11 pr-4 font-semibold tracking-[-0.32px]">
          {notification.title}
          {notification.groupCount > 1 && ` 외 ${notification.groupCount - 1}건`}
        </span>
        <span className="text-body-sm text-neutral-11 pr-4 font-normal tracking-[-0.32px]">
          {notification.content}
        </span>
      </button>
    </li>
  )
}

function NotificationListSkeleton() {
  return (
    <ul
      className="flex flex-col gap-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="알림 목록 불러오는 중"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <li
          key={index}
          className="border-border-input bg-neutral-2 flex h-30 w-full items-center rounded-lg border-[0.749px] px-4 py-3"
        />
      ))}
    </ul>
  )
}

/** 알림 type 기준 이동 경로 산출 — BE targetType은 enum 미정의(자유 문자열)라 type으로 분기 */
function notificationLink(notification: AppNotification): string | null {
  switch (notification.type) {
    case 'SCHEDULE_ASSIGNED':
    case 'SCHEDULE_CREATED':
      return '/calendar'
    case 'PROJECT_JOINED':
    case 'VIDEO_FEEDBACK_COMMENTED':
    case 'NOTICE_CREATED':
    case 'FILE_UPLOADED':
    case 'DEADLINE_REMINDER':
      return notification.projectId ? `/workspace/projects/${notification.projectId}` : null
    case 'RECRUITMENT_APPLIED':
      return `/matching/${notification.targetId}`
    default:
      return null
  }
}

export default function NotificationPage() {
  const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications()
  const hasUnread = notifications.some((item) => !item.isRead)

  function handleClick(notification: AppNotification) {
    if (!notification.isRead) void markAsRead(notification.notificationId)
    const link = notificationLink(notification)
    if (link) navigate(link)
  }

  return (
    <section className="flex flex-col gap-11.75">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="뒤로가기"
            className="text-neutral-11 flex size-8 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-head-lg text-neutral-11 leading-[1.7] font-bold">알림</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void markAllAsRead()}
          disabled={!hasUnread}
          className="w-23"
        >
          전체 읽음
        </Button>
      </header>

      {loading && <NotificationListSkeleton />}
      {error && <p className="text-body-sm text-warning">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-body-sm text-neutral-6">알림이 없습니다.</p>
      )}

      {!loading && !error && notifications.length > 0 && (
        <ul className="flex flex-col gap-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
              onClick={() => handleClick(notification)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
