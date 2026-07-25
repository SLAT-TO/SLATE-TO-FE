import { useMemo } from 'react'
import type { CalendarProps } from '../types/Calendar.types'
import { chunkWeeks, getMonthGrid, getOverflowCounts } from '../utils/calendarUtils'
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
  const overflowByDate = useMemo(
    () => getOverflowCounts(weeks, events, maxLanesPerDay),
    [weeks, events, maxLanesPerDay],
  )

  return (
    <div className="relative inline-block">
      <CalendarGrid
        month={month}
        weeks={weeks}
        onDateClick={onDateClick}
        overflowByDate={overflowByDate}
      />
      <EventBarLayer
        weeks={weeks}
        events={events}
        maxLanes={maxLanesPerDay}
        onEventClick={onEventClick}
      />
    </div>
  )
}
