import { useMemo } from 'react'
import { format, isSameMonth, isToday } from 'date-fns'
import type { CalendarEvent, CalendarProps } from '../types/Calendar.types'
import { getMonthGrid, toDateKey } from '../utils/calendarUtils'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

export function Calendar({ month, events, onDateClick, onEventClick }: CalendarProps) {
  const days = useMemo(() => getMonthGrid(month), [month])

  // 날짜별로 이벤트를 묶어둔다 (매 셀마다 events 전체를 도는 걸 방지)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return map
  }, [events])

  return (
    <div className="inline-block">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-[repeat(7,147px)]">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="text-neutral-6 flex h-12 items-start bg-[#E9F2FE] pt-2 pl-2 text-sm"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="border-border grid grid-cols-[repeat(7,147px)] border-t border-l">
        {days.map((day) => {
          const key = toDateKey(day)
          const dayEvents = eventsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, month)

          return (
            <div
              key={key}
              onClick={() => onDateClick?.(day)}
              className="border-border bg-bg-primary flex h-[147px] cursor-pointer flex-col items-stretch gap-1 border-r border-b pt-2 pr-2 pl-2"
            >
              <span
                className={`text-sm ${inMonth ? 'text-neutral-10' : 'text-neutral-5'} ${
                  isToday(day) ? 'text-primary font-bold' : ''
                }`}
              >
                {format(day, 'd')}
              </span>

              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation() // 셀의 onDateClick 안 터지게
                    onEventClick?.(event)
                  }}
                  className="truncate rounded-md px-2 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: event.color ?? '#3B5BFF' }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
