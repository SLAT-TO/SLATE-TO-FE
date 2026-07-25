import type { CalendarEvent } from '../schemas/calendarEvent'

export interface CalendarProps {
  month: Date
  events: CalendarEvent[]
  /** 옆 패널에 일정을 띄우고 있는 날짜 — 셀 강조 표시용 */
  selectedDate?: Date | null
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}
