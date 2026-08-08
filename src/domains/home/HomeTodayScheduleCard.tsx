import type { ScheduleDailyItem } from '../../types/schedule'

interface HomeTodayScheduleCardProps {
  schedules: ScheduleDailyItem[]
  loading: boolean
}

export default function HomeTodayScheduleCard({ schedules, loading }: HomeTodayScheduleCardProps) {
  return (
    <section className="flex w-full flex-col gap-3">
      {loading && (
        <div
          className="flex flex-col gap-3"
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label="오늘 일정 불러오는 중"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="border-border-input bg-neutral-2 h-16 w-full rounded-lg border-[0.749px]"
            />
          ))}
        </div>
      )}

      {!loading &&
        schedules.map((schedule) => (
          <div key={schedule.scheduleId} className="flex items-stretch gap-4">
            <span className="bg-warning w-2 shrink-0" style={{ height: 48 }} />
            <div className="flex flex-col justify-center gap-2">
              <p className="text-body-sm text-neutral-10 font-semibold tracking-[-0.32px]">
                {schedule.title}
              </p>
              {schedule.location && (
                <p className="text-caption-sm text-neutral-10 tracking-[-0.24px]">
                  {schedule.location}
                </p>
              )}
            </div>
          </div>
        ))}
    </section>
  )
}
