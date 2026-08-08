import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { getScheduleSummary } from '../../api/schedules'
import { toDateKey } from '../../utils/calendarUtils'
import { navigate } from '../../utils/navigation'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function PrevIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M7.30462 8.23609C7.27357 8.20512 7.24895 8.16834 7.23214 8.12784C7.21534 8.08734 7.20669 8.04393 7.20669 8.00009C7.20669 7.95624 7.21534 7.91283 7.23214 7.87233C7.24895 7.83183 7.27357 7.79505 7.30462 7.76409L10.3619 4.70742C10.5495 4.51991 10.655 4.26556 10.655 4.00032C10.6551 3.73508 10.5498 3.48068 10.3623 3.29308C10.1748 3.10549 9.92042 3.00006 9.65518 3C9.38994 2.99994 9.13554 3.10524 8.94795 3.29275L5.89062 6.35008C5.4538 6.78811 5.2085 7.38148 5.2085 8.00009C5.2085 8.61869 5.4538 9.21206 5.89062 9.65009L8.94795 12.7074C9.13554 12.8949 9.38994 13.0002 9.65518 13.0002C9.92042 13.0001 10.1748 12.8947 10.3623 12.7071C10.5498 12.5195 10.6551 12.2651 10.655 11.9999C10.655 11.7346 10.5495 11.4803 10.3619 11.2928L7.30462 8.23609Z"
        fill="#1E293B"
      />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8.69538 8.23609C8.72643 8.20512 8.75105 8.16834 8.76786 8.12784C8.78466 8.08734 8.79331 8.04393 8.79331 8.00009C8.79331 7.95624 8.78466 7.91283 8.76786 7.87233C8.75105 7.83183 8.72643 7.79505 8.69538 7.76409L5.63806 4.70742C5.45046 4.51991 5.34503 4.26556 5.34497 4.00032C5.34491 3.73508 5.45021 3.48068 5.63772 3.29308C5.82523 3.10549 6.07958 3.00006 6.34482 3C6.61006 2.99994 6.86446 3.10524 7.05205 3.29275L10.1094 6.35008C10.5462 6.78811 10.7915 7.38148 10.7915 8.00009C10.7915 8.61869 10.5462 9.21206 10.1094 9.65009L7.05205 12.7074C6.86446 12.8949 6.61006 13.0002 6.34482 13.0002C6.07958 13.0001 5.82523 12.8947 5.63772 12.7071C5.45021 12.5195 5.34491 12.2651 5.34497 11.9999C5.34503 11.7346 5.45046 11.4803 5.63806 11.2928L8.69538 8.23609Z"
        fill="#1E293B"
      />
    </svg>
  )
}

/** 일요일 시작 6주(42칸) 그리드 */
function getSundayStartGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end: addDays(start, 41) })
}

interface HomeMiniCalendarProps {
  className?: string
}

export default function HomeMiniCalendar({ className = '' }: HomeMiniCalendarProps) {
  const [month, setMonth] = useState(new Date())
  const days = useMemo(() => getSundayStartGrid(month), [month])
  const [scheduledDates, setScheduledDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    getScheduleSummary()
      .then((result) => {
        if (!cancelled) setScheduledDates(new Set(result.items.map((item) => item.date)))
      })
      .catch(() => {
        if (!cancelled) setScheduledDates(new Set())
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate('/calendar')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate('/calendar')
        }
      }}
      className={`flex cursor-pointer flex-col items-start gap-2 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMonth((m) => subMonths(m, 1))
          }}
          aria-label="이전 달"
          className="flex h-4 w-4 items-center justify-center"
        >
          <PrevIcon />
        </button>
        <span className="text-body-sm text-neutral-10 text-center font-semibold tracking-[-0.32px] capitalize">
          {format(month, 'yyyy.M')}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMonth((m) => addMonths(m, 1))
          }}
          aria-label="다음 달"
          className="flex h-4 w-4 items-center justify-center"
        >
          <NextIcon />
        </button>
      </div>

      <div className="grid grid-cols-[repeat(7,30px)] gap-x-1.5 gap-y-0">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="flex h-7.5 w-7.5 items-center justify-center text-center text-[18px] leading-7.5 font-normal tracking-[-0.36px] text-black capitalize"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(7,30px)] gap-x-1.5 gap-y-0">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)
          const hasSchedule = inMonth && scheduledDates.has(toDateKey(day))
          return (
            <span
              key={day.toISOString()}
              className="relative flex h-7.5 w-7.5 items-center justify-center"
            >
              {hasSchedule && (
                <span className="bg-main-3 absolute size-5 rounded-full" aria-hidden />
              )}
              <span
                className={`relative text-center text-[18px] leading-7.5 font-normal tracking-[-0.36px] capitalize ${
                  inMonth ? 'text-neutral-10' : 'text-neutral-4'
                } ${today ? 'text-primary font-bold' : ''}`}
              >
                {format(day, 'd')}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
