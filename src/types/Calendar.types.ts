import { z } from 'zod'

// 이벤트 데이터 형태. 날짜는 'yyyy-MM-dd' 문자열로 통일 (그리드 키랑 맞추기 위해)
export const calendarEventSchema = z.object({
  id: z.string(),
  date: z.string(), // 'yyyy-MM-dd'
  title: z.string(),
  color: z.string().optional(),
})

export type CalendarEvent = z.infer<typeof calendarEventSchema>

export interface CalendarProps {
  // 보여줄 달 (이 달이 속한 아무 날짜나 OK)
  month: Date
  // 표시할 이벤트들 (페이지에서 내려줌)
  events: CalendarEvent[]
  // 빈 칸(날짜) 클릭 → 일정 추가 트리거
  onDateClick?: (date: Date) => void
  // 이벤트 막대 클릭 → 상세/수정 트리거
  onEventClick?: (event: CalendarEvent) => void
}
