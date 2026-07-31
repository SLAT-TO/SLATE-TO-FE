import type { ReactNode } from 'react'
import { format, getDay, isSameDay, isSameMonth, isToday } from 'date-fns'
import { CALENDAR_HEADER_HEIGHT_PX, toDateKey } from '../utils/calendarUtils'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

interface CalendarGridProps {
  month: Date
  weeks: Date[][]
  onDateClick?: (date: Date) => void
  /** 날짜별 오버플로 이벤트 개수 — 있으면 날짜 숫자 옆에 "+N"으로 표시 */
  overflowByDate?: Map<string, number>
  /** 옆 패널에 일정을 띄우고 있는 날짜 — 셀 강조 표시용 */
  selectedDate?: Date | null
  /** 주(week) 배경 그리드 위에 겹쳐 그릴 오버레이(이벤트 바) — 화면 높이에 맞춰 유동적인
   * 주 행과 정확히 같은 높이로 겹치도록, 각 주의 relative 래퍼 안에 렌더링을 위임한다.
   * CalendarGrid 자체는 이벤트를 몰라도 되므로 여기선 ReactNode만 받는다. */
  renderWeekOverlay?: (week: Date[], weekIndex: number) => ReactNode
}

// 날짜 그리드(틀) — 요일 헤더 + 날짜 셀 배경만 담당. events를 몰라도 단독으로 렌더링 가능.
// 요일 헤더만 고정 높이(CALENDAR_HEADER_HEIGHT_PX)이고, 나머지 6주 행은 flex-1로 남은
// 화면 높이를 균등 분배해 부모 높이에 맞춰 유동적으로 커지거나 줄어든다.
export function CalendarGrid({
  month,
  weeks,
  onDateClick,
  overflowByDate,
  selectedDate,
  renderWeekOverlay,
}: CalendarGridProps) {
  const clickable = Boolean(onDateClick)

  return (
    <div className="flex h-full w-full flex-col">
      {/* 요일 헤더 */}
      <div
        className="border-neutral-3 grid shrink-0 grid-cols-7 overflow-hidden rounded-t-[10.242px] border-[0.75px]"
        style={{ height: CALENDAR_HEADER_HEIGHT_PX }}
      >
        {WEEKDAYS.map((label, index) => (
          <div
            key={label}
            className={`text-body-sm flex shrink-0 items-center justify-center gap-2.5 bg-white font-semibold tracking-[-0.32px] capitalize ${
              index === 6 ? 'text-warning' : index === 5 ? 'text-primary' : 'text-[#2D2D2D]'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 주 단위 날짜 그리드 — 남은 높이를 6주로 균등 분배 */}
      {weeks.map((week, weekIndex) => (
        <div
          key={toDateKey(week[0])}
          className="border-neutral-3 relative min-h-0 flex-1 border-l-[0.75px]"
        >
          <div className="grid h-full grid-cols-7">
            {week.map((day) => {
              const key = toDateKey(day)
              const inMonth = isSameMonth(day, month)
              const isSunday = getDay(day) === 0
              const isSaturday = getDay(day) === 6
              const overflowCount = overflowByDate?.get(key)
              const selected = !!selectedDate && isSameDay(day, selectedDate)

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
                  className={`border-neutral-3 flex flex-col items-start gap-2.5 border-r-[0.75px] border-b-[0.75px] p-2 ${
                    selected ? 'bg-main-1' : 'bg-white'
                  } ${clickable ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-sm ${inMonth ? 'text-neutral-10' : 'text-neutral-5'} ${
                        isSunday && inMonth ? 'text-warning' : ''
                      } ${isSaturday && inMonth ? 'text-primary' : ''} ${
                        isToday(day) ? 'text-primary font-bold' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {overflowCount ? (
                      <span className="text-caption-sm text-neutral-5 relative -top-px font-normal tracking-[-0.24px]">
                        +{overflowCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          {renderWeekOverlay?.(week, weekIndex)}
        </div>
      ))}
    </div>
  )
}
