import { z } from 'zod'

// 이벤트 데이터 형태. 날짜는 'yyyy-MM-dd' 문자열로 통일
export const calendarEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  color: z.string().optional(),
})

export type CalendarEvent = z.infer<typeof calendarEventSchema>
