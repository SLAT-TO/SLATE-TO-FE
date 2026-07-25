import { format, getDay, isSameMonth, isToday } from 'date-fns'
import { toDateKey } from '../utils/calendarUtils'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

interface CalendarGridProps {
  month: Date
  weeks: Date[][]
  onDateClick?: (date: Date) => void
  /** 날짜별 오버플로 이벤트 개수 — 있으면 날짜 숫자 옆에 "+N"으로 표시 */
  overflowByDate?: Map<string, number>
}

// 날짜 그리드(틀) — 요일 헤더 + 날짜 셀 배경만 담당. events를 몰라도 단독으로 렌더링 가능.
// 셀 크기(h-36.75)·헤더 높이(h-12)는 EventBarLayer의 offset 계산과 반드시 일치해야 함(calendarUtils 상수 참고).
export function CalendarGrid({ month, weeks, onDateClick, overflowByDate }: CalendarGridProps) {
  const clickable = Boolean(onDateClick)

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

      {/* 주 단위 날짜 그리드 */}
      {weeks.map((week) => (
        <div
          key={toDateKey(week[0])}
          className="border-border grid grid-cols-[repeat(7,147px)] border-l"
        >
          {week.map((day) => {
            const key = toDateKey(day)
            const inMonth = isSameMonth(day, month)
            const isSunday = getDay(day) === 0
            const overflowCount = overflowByDate?.get(key)

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
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-sm ${inMonth ? 'text-neutral-10' : 'text-neutral-5'} ${
                      isSunday && inMonth ? 'text-warning' : ''
                    } ${isToday(day) ? 'text-primary font-bold' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>
                  {overflowCount ? (
                    <span className="text-neutral-6 text-xs font-medium">+{overflowCount}</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
