import { useMemo } from 'react'
import { format, getDay, isSameMonth, isToday } from 'date-fns'
import type { CalendarEvent } from '../schemas/calendarEvent'
import type { CalendarProps } from '../types/Calendar.types'
import { assignEventLanes, chunkWeeks, getMonthGrid, toDateKey } from '../utils/calendarUtils'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const DEFAULT_MAX_LANES = 2

interface WeekRowProps {
  week: Date[]
  month: Date
  events: CalendarEvent[]
  maxLanes: number
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

// 한 주(week) — 날짜 그리드(배경)와 이벤트 바 그리드(오버레이)를 같은 7열 트랙으로 겹쳐 그린다.
function WeekRow({ week, month, events, maxLanes, onDateClick, onEventClick }: WeekRowProps) {
  const { positioned, overflowByDay } = useMemo(
    () => assignEventLanes(week, events, maxLanes),
    [week, events, maxLanes],
  )

  return (
    <div className="relative">
      {/* 날짜 배경 레이어 — 셀 테두리·날짜 숫자·클릭 영역 */}
      <div className="border-border grid grid-cols-[repeat(7,147px)] border-l">
        {week.map((day) => {
          const key = toDateKey(day)
          const inMonth = isSameMonth(day, month)
          const isSunday = getDay(day) === 0
          const clickable = Boolean(onDateClick)

          return (
            <div
              key={key}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => onDateClick?.(day) : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onDateClick?.(day)
                      }
                    }
                  : undefined
              }
              className={`border-border bg-bg-primary h-36.75 border-r border-b pt-2 pr-2 pl-2 ${
                clickable ? 'cursor-pointer' : ''
              }`}
            >
              <span
                className={`text-sm ${inMonth ? 'text-neutral-10' : 'text-neutral-5'} ${
                  isSunday && inMonth ? 'text-warning' : ''
                } ${isToday(day) ? 'text-primary font-bold' : ''}`}
              >
                {format(day, 'd')}
              </span>
            </div>
          )
        })}
      </div>

      {/* 이벤트 바 오버레이 레이어 — 날짜 숫자 아래부터 시작, 레인 단위로 쌓임 */}
      <div
        className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(7,147px)] gap-y-0.5 pt-7"
        style={{ gridAutoRows: '20px' }}
      >
        {positioned.map(({ event, startCol, span, lane }) => (
          <div
            key={event.id}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onEventClick?.(event)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onEventClick?.(event)
              }
            }}
            style={{
              gridColumn: `${startCol + 1} / span ${span}`,
              gridRow: lane + 1,
              backgroundColor: event.color ?? '#3B5BFF',
            }}
            className="pointer-events-auto mr-2 truncate rounded-md px-2 py-0.5 text-xs font-medium text-white"
          >
            {event.title}
          </div>
        ))}

        {[...overflowByDay.entries()].map(([dayKey, count]) => {
          const colIndex = week.findIndex((day) => toDateKey(day) === dayKey)
          return (
            <span
              key={dayKey}
              style={{ gridColumn: colIndex + 1, gridRow: maxLanes + 1 }}
              className="text-neutral-6 pl-2 text-xs font-medium"
            >
              +{count}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function Calendar({
  month,
  events,
  maxLanesPerDay = DEFAULT_MAX_LANES,
  onDateClick,
  onEventClick,
}: CalendarProps) {
  const days = useMemo(() => getMonthGrid(month), [month])
  const weeks = useMemo(() => chunkWeeks(days), [days])

  return (
    <div className="inline-block">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-[repeat(7,147px)]">
        {WEEKDAYS.map((label, index) => (
          <div
            key={label}
            className={`text-caption-lg flex h-12 items-start bg-[#E9F2FE] pt-2 pl-2 ${
              index === 6 ? 'text-warning' : 'text-neutral-6'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 주 단위 그리드 */}
      {weeks.map((week) => (
        <WeekRow
          key={toDateKey(week[0])}
          week={week}
          month={month}
          events={events}
          maxLanes={maxLanesPerDay}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  )
}
