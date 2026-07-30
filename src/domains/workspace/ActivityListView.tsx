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
  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-body-sm text-neutral-11 w-fit font-semibold"
      >
        {'< 대시보드'}
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-head-sm text-neutral-11 font-bold">최근 활동</h2>
        {/* BE에 활동 읽음 상태 API가 없어 mock 전용 — 현재는 목록 확인 UI만 제공 */}
        <Button variant="secondary" size="sm">
          전체 읽음
        </Button>
      </div>

      {activities.length === 0 ? (
        <p className="text-caption-lg text-neutral-6">최근 활동이 없습니다.</p>
      ) : (
        <ul className={`flex flex-col ${CARD_BASE}`}>
          {activities.map((activity, index) => (
            <li
              key={activity.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${
                index > 0 ? 'border-neutral-3 border-t' : ''
              }`}
            >
              <span className="text-body-sm text-neutral-10">{activity.content}</span>
              <span className="text-caption-sm text-neutral-6 shrink-0">
                {formatActivityDate(activity.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
