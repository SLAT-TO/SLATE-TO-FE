import { useMemo, useState } from 'react'
import { addMonths, format, getDay, isSameDay, isSameMonth, isToday, subMonths } from 'date-fns'
import { getMonthGrid } from '../utils/getMonthGrid'
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcons'

export interface DateRangeValue {
  from?: Date
  to?: Date
}

interface DateRangeCalendarProps {
  value?: DateRangeValue
  onChange: (range: DateRangeValue | undefined) => void
  onComplete?: () => void // 시작~종료 다 골랐을 때
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 기간 선택 달력 코어 (input·팝업 없이 달력만)
// 동작: 첫 클릭 → 시작일=종료일(하루), 이후 클릭 → 종료일 선택
export function DateRangeCalendar({ value, onChange, onComplete }: DateRangeCalendarProps) {
  // 종료일을 기다리는 중인지 (첫 클릭 후 true)
  const [awaitingEnd, setAwaitingEnd] = useState(false)
  const [month, setMonth] = useState(value?.from ?? new Date())

  const days = useMemo(() => getMonthGrid(month), [month])

  function handleDayClick(day: Date) {
    // 새 시작: 클릭한 날을 시작일=종료일로 채움 (하루짜리)
    if (!value?.from || !awaitingEnd) {
      onChange({ from: day, to: day })
      setAwaitingEnd(true)
      return
    }

    // 종료일 선택 중인데 시작일보다 앞을 누르면 → 그 날을 새 시작으로
    if (day < value.from) {
      onChange({ from: day, to: day })
      setAwaitingEnd(true)
      return
    }

    // 종료일 확정 → 범위 완성
    onChange({ from: value.from, to: day })
    setAwaitingEnd(false)
    onComplete?.() // 범위 완성 → 알림
  }

  const from = value?.from
  const to = value?.to
  const hasRange = !!from && !!to && !isSameDay(from, to)

  return (
    <div className="w-fit">
      <div className="mb-2 flex items-center justify-start gap-2">
        <button
          type="button"
          onClick={() => setMonth((prev) => subMonths(prev, 1))}
          className="text-neutral-10 hover:opacity-70 flex h-4 w-4 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <span className="text-body-sm text-neutral-10 text-center leading-[normal] font-semibold tracking-[-0.32px] capitalize">
          {format(month, 'yyyy.M')}
        </span>
        <button
          type="button"
          onClick={() => setMonth((prev) => addMonths(prev, 1))}
          className="text-neutral-10 hover:opacity-70 flex h-4 w-4 items-center justify-center"
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
          const today = isToday(day)
          const dayOfWeek = getDay(day)

          const isStart = !!from && isSameDay(day, from)
          const isEnd = !!to && isSameDay(day, to)
          const isMiddle = !!from && !!to && day > from && day < to
          const isEndpoint = isStart || isEnd

          const weekdayClass =
            dayOfWeek === 0 ? 'text-warning' : dayOfWeek === 6 ? 'text-secondary' : ''

          return (
            <div
              key={day.toISOString()}
              className="relative flex h-7.5 w-7.5 items-center justify-center"
            >
              {hasRange && isMiddle && <div className="bg-main-1 absolute inset-0" />}
              {hasRange && isStart && <div className="bg-main-1 absolute inset-y-0 right-0 w-1/2" />}
              {hasRange && isEnd && <div className="bg-main-1 absolute inset-y-0 left-0 w-1/2" />}

              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={`relative flex h-7.5 w-7.5 items-center justify-center rounded-full text-[18px] leading-7.5 font-normal tracking-[-0.36px] capitalize transition-colors ${
                  isEndpoint
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
