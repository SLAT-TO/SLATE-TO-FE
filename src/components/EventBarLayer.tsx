import type { CalendarEvent } from '../schemas/calendarEvent'
import {
  CALENDAR_CELL_HEIGHT_PX,
  CALENDAR_HEADER_HEIGHT_PX,
  toDateKey,
  type PositionedEvent,
} from '../utils/calendarUtils'

interface EventBarLayerProps {
  weeks: Date[][]
  /** Calendar.tsx가 한 번만 계산해 넘겨주는 주별 레인 배치 결과 (positioned만 사용, overflow는 CalendarGrid 담당) */
  weekLanes: { positioned: PositionedEvent[] }[]
  onEventClick?: (event: CalendarEvent) => void
}

// 이벤트 바 오버레이 — CalendarGrid 위에 절대 위치로 겹쳐진다.
// 각 주(week)의 세로 offset은 헤더 높이 + (주 인덱스 * 셀 높이)로 계산한다.
export function EventBarLayer({ weeks, weekLanes, onEventClick }: EventBarLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {weeks.map((week, weekIndex) => (
        <WeekEventBars
          key={toDateKey(week[0])}
          positioned={weekLanes[weekIndex].positioned}
          onEventClick={onEventClick}
          top={CALENDAR_HEADER_HEIGHT_PX + weekIndex * CALENDAR_CELL_HEIGHT_PX}
        />
      ))}
    </div>
  )
}

interface WeekEventBarsProps {
  positioned: PositionedEvent[]
  onEventClick?: (event: CalendarEvent) => void
  top: number
}

// 한 주(week)의 이벤트 바를 그린다. maxLanes를 넘는 이벤트는 CalendarGrid의 "+N" 배지로 표시됨.
function WeekEventBars({ positioned, onEventClick, top }: WeekEventBarsProps) {
  return (
    <div
      className="absolute grid grid-cols-[repeat(7,147px)] gap-y-1 pt-7"
      style={{ top, left: 0, right: 0, height: CALENDAR_CELL_HEIGHT_PX, gridAutoRows: '30px' }}
    >
      {positioned.map(({ event, startCol, span, lane }) => {
        const accent = event.color ?? 'var(--color-event-1)'

        return (
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
              borderStyle: 'solid',
              borderWidth: '0.75px',
              borderColor: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 12%, white)`,
              color: accent,
            }}
            className="text-caption-sm pointer-events-auto mx-2 flex min-w-0 items-center gap-2.5 rounded-full px-2 leading-none font-semibold tracking-[-0.24px]"
          >
            <span
              className="h-3.25 w-3.25 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="min-w-0 flex-1 truncate">{event.title}</span>
          </div>
        )
      })}
    </div>
  )
}
