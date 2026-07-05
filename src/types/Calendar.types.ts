import type { CalendarEvent } from '../schemas/calendarEvent'

export interface CalendarProps {
  month: Date
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}
