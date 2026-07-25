import { useMemo, useState } from 'react'
import { addMonths, format, getDay, isSameDay, isSameMonth, isToday, subMonths } from 'date-fns'
import { getMonthGrid } from '../utils/getMonthGrid'
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcons'

interface DateCalendarProps {
  value?: Date
  onChange: (date: Date | undefined) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 단일 날짜 선택 달력 코어 (마감일 등 하루만 고를 때)
export function DateSingleCalendar({ value, onChange }: DateCalendarProps) {
  const [month, setMonth] = useState(value ?? new Date())

  const days = useMemo(() => getMonthGrid(month), [month])

  return (
    <div className="w-fit">
      <div className="mb-2 flex items-center justify-start gap-2">
        <button
          type="button"
          onClick={() => setMonth((prev) => subMonths(prev, 1))}
          className="text-neutral-10 flex h-4 w-4 items-center justify-center hover:opacity-70"
        >
          <ChevronLeftIcon />
        </button>
        <span className="text-body-sm text-neutral-10 text-center leading-[normal] font-semibold tracking-[-0.32px] capitalize">
          {format(month, 'yyyy.M')}
        </span>
        <button
          type="button"
          onClick={() => setMonth((prev) => addMonths(prev, 1))}
          className="text-neutral-10 flex h-4 w-4 items-center justify-center hover:opacity-70"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((label) => (
          <span
            key={label}
            className={`flex h-7.5 w-7.5 items-center justify-center text-[18px] leading-7.5 font-normal tracking-[-0.36px] capitalize ${
              label === '일' ? 'text-neutral-10' : 'text-black'
            }`}
          >
            {label}
          </span>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month)
          const selected = !!value && isSameDay(day, value)
          const today = isToday(day)
          const dayOfWeek = getDay(day)

          const weekdayClass =
            dayOfWeek === 0 ? 'text-warning' : dayOfWeek === 6 ? 'text-secondary' : ''

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onChange(day)}
              className={`flex h-7.5 w-7.5 items-center justify-center rounded-full text-[18px] leading-7.5 font-normal tracking-[-0.36px] capitalize transition-colors ${
                selected
                  ? 'bg-primary text-white'
                  : `hover:bg-neutral-2 ${
                      inMonth
                        ? `${today ? 'text-primary font-bold' : 'text-neutral-10'} ${weekdayClass}`
                        : 'text-neutral-5'
                    }`
              }`}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
