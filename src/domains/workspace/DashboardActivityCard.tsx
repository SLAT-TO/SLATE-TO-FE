import type { ProjectActivity } from '../../types/project'
import { CARD_BASE } from '../../styles/card'

interface DashboardActivityCardProps {
  activities: ProjectActivity[]
  onExpand: () => void
}

export default function DashboardActivityCard({
  activities,
  onExpand,
}: DashboardActivityCardProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">최근 활동</h2>
      <button
        type="button"
        onClick={onExpand}
        aria-label="최근 활동 전체 보기"
        className={`flex min-h-[183px] flex-col ${CARD_BASE} p-4 text-left ${activities.length === 0 ? 'justify-center' : 'justify-start'}`}
      >
        {activities.length === 0 ? (
          <p className="text-caption-lg text-neutral-6">최근 활동이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {activities.map((activity) => (
              <li key={activity.id} className="text-body-sm text-neutral-10">
                {activity.content}
              </li>
            ))}
          </ul>
        )}
      </button>
    </section>
  )
}
