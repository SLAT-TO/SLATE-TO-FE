import { useMemo } from 'react'
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

interface CalendarMiniPickerProps {
  month: Date
  selectedDate: Date | null
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: Date) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 일요일 시작(월 캘린더의 월요일 시작과는 다름 — 이 팝업 전용)
function getSundayFirstMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end: addDays(start, 41) })
}

// "기간" 날짜 선택용 미니 캘린더. 배경·테두리 없이 숫자만 떠 있는 형태 — 사용하는 쪽에서 위치를 잡는다
export function CalendarMiniPicker({
  month,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: CalendarMiniPickerProps) {
  const days = useMemo(() => getSundayFirstMonthGrid(month), [month])

  return (
    <div className="w-fit">
      <div className="mb-2 flex items-center justify-start gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="text-neutral-6 hover:text-neutral-9 text-caption-lg flex h-5 w-5 items-center justify-center leading-none"
        >
          ‹
        </button>
        <span className="text-caption-lg text-neutral-10 font-semibold">
          {format(month, 'yyyy.M')}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="text-neutral-6 hover:text-neutral-9 text-caption-lg flex h-5 w-5 items-center justify-center leading-none"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((label) => (
          <span
            key={label}
            className="text-caption-sm text-neutral-6 flex h-8 w-9 items-center justify-center"
          >
            {label}
          </span>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month)
          const selected = !!selectedDate && isSameDay(day, selectedDate)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`text-body-sm flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                selected
                  ? 'bg-primary text-white'
                  : `hover:bg-neutral-2 ${inMonth ? 'text-neutral-10' : 'text-neutral-4'}`
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
