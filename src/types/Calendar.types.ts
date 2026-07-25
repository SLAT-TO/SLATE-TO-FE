import type { CalendarEvent } from '../schemas/calendarEvent'

export interface CalendarProps {
  month: Date
  events: CalendarEvent[]
  /** 옆 패널에 일정을 띄우고 있는 날짜 — 셀 강조 표시용 */
  selectedDate?: Date | null
  /** 하루에 보여줄 최대 이벤트 레인 수. 넘치면 "+N"으로 표시 (기본 2) */
  maxLanesPerDay?: number
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}
