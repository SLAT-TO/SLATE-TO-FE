import Choice from '../../components/Choice'
import type { ProjectActivity } from '../../types/project'
import { CARD_BASE } from '../../styles/card'

interface DashboardActivityCardProps {
  activities: ProjectActivity[]
  checkedActivityIds: Set<number>
  onToggle: (activityId: number, checked: boolean) => void
}

export default function DashboardActivityCard({
  activities,
  checkedActivityIds,
  onToggle,
}: DashboardActivityCardProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">최근 활동</h2>
      <div
        className={`flex min-h-[183px] flex-col ${CARD_BASE} p-4 ${activities.length === 0 ? 'justify-center' : 'justify-start'}`}
      >
        {activities.length === 0 ? (
          <p className="text-caption-lg text-neutral-6">최근 활동이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {activities.map((activity) => (
              <li key={activity.id}>
                <Choice
                  type="checkbox"
                  className="relative"
                  checked={checkedActivityIds.has(activity.id)}
                  onChange={(checked) => onToggle(activity.id, checked)}
                  label={activity.content}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
