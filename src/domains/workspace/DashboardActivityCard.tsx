import Choice from '../../components/Choice'
import type { ProjectActivity } from '../../types/project'

const CARD_SHADOW = 'shadow-[0px_3.4px_12.5px_rgba(169,204,244,0.15)]'

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
        className={`flex min-h-[183px] flex-col rounded-[10px] bg-white p-4 ${CARD_SHADOW} ${activities.length === 0 ? 'justify-center' : 'justify-start'}`}
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
