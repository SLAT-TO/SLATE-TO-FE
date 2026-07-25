import { useMemo } from 'react'
import type { CalendarProps } from '../types/Calendar.types'
import { assignEventLanes, chunkWeeks, getMonthGrid } from '../utils/calendarUtils'
import { CalendarGrid } from './CalendarGrid'
import { EventBarLayer } from './EventBarLayer'

const DEFAULT_MAX_LANES = 2

// 날짜 그리드(CalendarGrid)와 이벤트 바 오버레이(EventBarLayer)를 relative/absolute로 합성만 하는 조립 컴포넌트.
export function Calendar({
  month,
  events,
  maxLanesPerDay = DEFAULT_MAX_LANES,
  onDateClick,
  onEventClick,
}: CalendarProps) {
  const days = useMemo(() => getMonthGrid(month), [month])
  const weeks = useMemo(() => chunkWeeks(days), [days])

  // 주(week)별 레인 배치를 여기서 한 번만 계산해 CalendarGrid(오버플로 배지)와
  // EventBarLayer(이벤트 바)가 같은 결과를 나눠 쓴다 (각자 assignEventLanes를 다시 돌리지 않음).
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

  return (
    <div className="relative inline-block">
      <CalendarGrid
        month={month}
        weeks={weeks}
        onDateClick={onDateClick}
        overflowByDate={overflowByDate}
      />
      <EventBarLayer weeks={weeks} weekLanes={weekLanes} onEventClick={onEventClick} />
    </div>
  )
}
