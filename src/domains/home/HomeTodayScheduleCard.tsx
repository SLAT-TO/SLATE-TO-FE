import { format } from 'date-fns'
import type { Schedule } from '../../types/schedule'

interface HomeTodayScheduleCardProps {
  schedules: Schedule[]
  loading: boolean
}

export default function HomeTodayScheduleCard({ schedules, loading }: HomeTodayScheduleCardProps) {
  return (
    <section className="flex w-full flex-col gap-3">
      {loading && <p className="text-caption-lg text-neutral-6">불러오는 중…</p>}

      {!loading &&
        schedules.map((schedule) => (
          <div key={schedule.id} className="flex items-stretch gap-3">
            <span className="bg-warning w-2 shrink-0" style={{ height: 48 }} />
            <div className="flex flex-col justify-center gap-1">
              <p className="text-body-sm text-neutral-10 font-semibold tracking-[-0.32px]">
                {schedule.title}
              </p>
              <p className="text-caption-sm text-neutral-10 tracking-[-0.24px]">
                {[schedule.location, format(new Date(schedule.startAt), 'HH:mm')]
                  .filter(Boolean)
                  .join('   ')}
              </p>
            </div>
          </div>
        ))}
    </section>
  )
}
