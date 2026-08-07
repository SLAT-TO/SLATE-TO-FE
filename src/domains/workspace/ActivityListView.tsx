import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/Button'
import { markActivityRead, markAllActivitiesRead } from '../../api/projects'
import { projectKeys } from '../../queries/keys'
import type { ProjectActivity } from '../../types/project'

const CARD_SHADOW = 'shadow-[var(--shadow-card)]'

interface ActivityListViewProps {
  projectId: number
  activities: ProjectActivity[]
  onBack: () => void
  onNavigate: (activity: ProjectActivity) => void
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

function canNavigate(activity: ProjectActivity): boolean {
  return (
    activity.targetType === 'NOTICE' ||
    activity.targetType === 'FILE' ||
    activity.targetType === 'SCHEDULE' ||
    activity.type === 'SCHEDULE_CREATED' ||
    activity.type === 'SCHEDULE_UPDATED' ||
    activity.type === 'PROJECT_MEMBER_JOINED' ||
    activity.type === 'PROJECT_UPDATED' ||
    activity.type === 'PROJECT_STATUS_CHANGED'
  )
}

export default function ActivityListView({
  projectId,
  activities,
  onBack,
  onNavigate,
}: ActivityListViewProps) {
  const queryClient = useQueryClient()
  const hasNew = activities.some((item) => item.isNew)

  const patchActivities = (updater: (items: ProjectActivity[]) => ProjectActivity[]) => {
    queryClient.setQueryData<ProjectActivity[]>(projectKeys.activities(projectId), (prev) =>
      updater(prev ?? []),
    )
  }

  const markAsRead = async (activityId: number) => {
    const target = activities.find((item) => item.activityId === activityId)
    if (!target?.isNew) return
    patchActivities((items) =>
      items.map((item) => (item.activityId === activityId ? { ...item, isNew: false } : item)),
    )
    try {
      await markActivityRead(projectId, activityId)
    } catch {
      void queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId) })
    }
  }

  const markAllAsRead = async () => {
    if (!hasNew) return
    patchActivities((items) => items.map((item) => ({ ...item, isNew: false })))
    try {
      await markAllActivitiesRead(projectId)
    } catch {
      void queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId) })
    }
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
          onClick={() => void markAllAsRead()}
          disabled={!hasNew}
        >
          전체 읽음
        </Button>
      </div>

      {activities.length === 0 ? (
        <p className="text-caption-lg text-neutral-6">최근 활동이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {activities.map((activity) => {
            const navigable = canNavigate(activity)
            return (
              <li
                key={activity.activityId}
                onClick={() => {
                  if (!navigable) return
                  if (activity.isNew) void markAsRead(activity.activityId)
                  onNavigate(activity)
                }}
                onMouseEnter={() => {
                  if (activity.isNew) void markAsRead(activity.activityId)
                }}
                className={`flex items-center justify-between gap-3 rounded-[10px] px-4 py-4 ${CARD_SHADOW} ${
                  activity.isNew ? 'bg-neutral-1' : 'bg-neutral-3'
                } ${navigable ? 'cursor-pointer' : ''}`}
              >
                <span className="text-body-sm text-neutral-10 min-w-0 tracking-[-0.32px]">
                  {activity.content}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-caption-sm text-neutral-6">
                    {formatActivityDate(activity.createdAt)}
                  </span>
                  {activity.isNew && (
                    <span
                      className="bg-warning size-2.75 shrink-0 rounded-full"
                      aria-label="새 활동"
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
