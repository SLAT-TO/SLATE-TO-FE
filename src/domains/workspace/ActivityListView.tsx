import { useState } from 'react'
import { Button } from '../../components/Button'
import type { ProjectActivity } from '../../types/project'
import { CARD_BASE } from '../../styles/card'

interface ActivityListViewProps {
  activities: ProjectActivity[]
  onBack: () => void
}

function formatActivityDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hours}:${minutes}`
}

export default function ActivityListView({ activities, onBack }: ActivityListViewProps) {
  /** BE에 활동 읽음 API가 없어 로컬에서만 읽음 처리한 id */
  const [locallyReadIds, setLocallyReadIds] = useState<Set<number>>(() => new Set())

  const items = activities.map((activity) =>
    locallyReadIds.has(activity.id) ? { ...activity, isRead: true } : activity,
  )
  const hasUnread = items.some((item) => !item.isRead)

  const markAllAsRead = () => {
    setLocallyReadIds(new Set(activities.map((activity) => activity.id)))
  }

  /** BE 활동 읽음 API 없음 — 호버 시 로컬에서 읽음 처리해 UI 확인을 쉽게 함 */
  const markAsRead = (activityId: number) => {
    setLocallyReadIds((prev) => {
      if (prev.has(activityId)) return prev
      const next = new Set(prev)
      next.add(activityId)
      return next
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-head-sm text-neutral-11 w-fit font-bold"
        >
          {'< 최근 활동'}
        </button>
        <Button
          variant="secondary"
          size="md"
          width={112}
          onClick={markAllAsRead}
          disabled={!hasUnread}
        >
          전체 읽음
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-caption-lg text-neutral-6">최근 활동이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((activity) => (
            <li
              key={activity.id}
              onMouseEnter={() => {
                if (!activity.isRead) markAsRead(activity.id)
              }}
              className={`flex items-center justify-between gap-3 ${CARD_BASE} px-4 py-4`}
            >
              <span className="text-body-sm text-neutral-10 min-w-0 tracking-[-0.32px]">
                {activity.content}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-caption-sm text-neutral-6">
                  {formatActivityDate(activity.createdAt)}
                </span>
                {!activity.isRead && (
                  <span
                    className="bg-warning size-2.75 shrink-0 rounded-full"
                    aria-label="안 읽음"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
