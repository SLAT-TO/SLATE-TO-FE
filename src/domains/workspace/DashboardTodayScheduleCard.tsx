import { useEffect, useState } from 'react'
import { getDailySchedules } from '../../api/schedules'
import type { Schedule } from '../../types/schedule'
import { toDateKey } from '../../utils/calendarUtils'
import { CARD_BASE } from '../../styles/card'

interface DashboardTodayScheduleCardProps {
  projectId: number
  onExpand: () => void
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export default function DashboardTodayScheduleCard({
  projectId,
  onExpand,
}: DashboardTodayScheduleCardProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getDailySchedules(toDateKey(new Date()), {
          projectId,
          scope: 'PROJECT',
        })
        if (!cancelled) setSchedules(result.items)
      } catch {
        if (!cancelled) setSchedules([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const todaySchedules = schedules

  return (
    <section className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onExpand}
        aria-label="프로젝트 일정으로 이동"
        className="w-fit text-left"
      >
        <h2 className="text-head-sm text-neutral-11 font-bold">오늘 일정 {'>'}</h2>
      </button>
      <button
        type="button"
        onClick={onExpand}
        aria-label="프로젝트 일정으로 이동"
        className={`flex min-h-[183px] flex-col justify-center ${CARD_BASE} p-4 text-left`}
      >
        {loading ? (
          <p className="text-caption-lg text-neutral-6">불러오는 중…</p>
        ) : todaySchedules.length === 0 ? (
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
      </button>
    </section>
  )
}
