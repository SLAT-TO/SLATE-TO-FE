import type { CalendarEvent } from '../schemas/calendarEvent'
import type { PositionedEvent } from '../utils/calendarUtils'

interface WeekEventBarsProps {
  positioned: PositionedEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

// 한 주(week)의 이벤트 바 오버레이. CalendarGrid가 그 주의 relative 래퍼(높이는 flex-1로 유동적) 안에
// 겹쳐서 렌더링하므로, 이 컴포넌트는 부모 높이에 absolute inset-0로만 맞추면 된다 (픽셀 계산 불필요).
// maxLanes를 넘는 이벤트는 여기서 안 그리고 CalendarGrid의 "+N" 배지로 표시됨.
export function WeekEventBars({ positioned, onEventClick }: WeekEventBarsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid grid-cols-7 gap-y-1.5 pt-8"
      style={{ gridAutoRows: '22px' }}
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
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            <span className="min-w-0 flex-1 truncate">{event.title}</span>
          </div>
        )
      })}
    </div>
  )
}
