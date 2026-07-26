import { useEffect, useState } from 'react'
import { getProjectSchedules } from '../../api/schedules'
import type { Schedule } from '../../types/schedule'
import { toDateKey } from '../../utils/calendarUtils'
import { CARD_BASE } from '../../styles/card'

interface DashboardTodayScheduleCardProps {
  projectId: number
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export default function DashboardTodayScheduleCard({ projectId }: DashboardTodayScheduleCardProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await getProjectSchedules(projectId)
        if (!cancelled) setSchedules(result.items)
      } catch {
        if (!cancelled) setSchedules([])
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const today = toDateKey(new Date())
  const todaySchedules = schedules.filter(
    (s) => s.startAt.slice(0, 10) <= today && s.endAt.slice(0, 10) >= today,
  )

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">오늘 일정</h2>
      <div className={`flex min-h-[183px] flex-col justify-center ${CARD_BASE} p-4`}>
        {todaySchedules.length === 0 ? (
          <p className="text-caption-lg text-neutral-6">오늘 등록된 일정이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {todaySchedules.map((schedule) => (
              <li key={schedule.id} className="flex items-start gap-3">
                <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-body-sm text-neutral-11 font-semibold">{schedule.title}</p>
                  <p className="text-caption-lg text-neutral-6">
                    {formatTime(schedule.startAt)}
                    {schedule.location && ` · ${schedule.location}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
