import { useCallback, useMemo } from 'react'
import type { CalendarProps } from '../types/Calendar.types'
import { assignEventLanes, chunkWeeks, getMonthGrid } from '../utils/calendarUtils'
import { CalendarGrid } from './CalendarGrid'
import { WeekEventBars } from './EventBarLayer'

const DEFAULT_MAX_LANES = 2

// 날짜 그리드(CalendarGrid)와 이벤트 바 오버레이(WeekEventBars)를 조립하는 컴포넌트.
// 주(week)마다 같은 높이(flex-1로 유동적)를 공유해야 해서, CalendarGrid에 주별 오버레이 렌더링을 위임한다.
export function Calendar({
  month,
  events,
  selectedDate,
  maxLanesPerDay = DEFAULT_MAX_LANES,
  onDateClick,
  onEventClick,
}: CalendarProps) {
  const days = useMemo(() => getMonthGrid(month), [month])
  const weeks = useMemo(() => chunkWeeks(days), [days])

  // 주(week)별 레인 배치를 여기서 한 번만 계산해 CalendarGrid(오버플로 배지)와
  // WeekEventBars(이벤트 바)가 같은 결과를 나눠 쓴다 (각자 assignEventLanes를 다시 돌리지 않음).
  const weekLanes = useMemo(
    () => weeks.map((week) => assignEventLanes(week, events, maxLanesPerDay)),
    [weeks, events, maxLanesPerDay],
  )

  const overflowByDate = useMemo(() => {
    const counts = new Map<string, number>()
    for (const { overflowByDay } of weekLanes) {
      overflowByDay.forEach((count, key) => counts.set(key, count))
    }
    return counts
  }, [weekLanes])

  // CalendarGrid가 React.memo로 감싸여 있어도, 인라인 함수를 그대로 넘기면 매 렌더 새 참조가
  // 되어 memo가 무효화된다 — weekLanes·onEventClick이 그대로면 참조를 유지한다
  const renderWeekOverlay = useCallback(
    (_week: Date[], weekIndex: number) => (
      <WeekEventBars positioned={weekLanes[weekIndex].positioned} onEventClick={onEventClick} />
    ),
    [weekLanes, onEventClick],
  )

  return (
    <CalendarGrid
      month={month}
      weeks={weeks}
      selectedDate={selectedDate}
      onDateClick={onDateClick}
      overflowByDate={overflowByDate}
      renderWeekOverlay={renderWeekOverlay}
    />
  )
}
