import { z } from 'zod'

// 이벤트 데이터 형태. 날짜는 'yyyy-MM-dd' 문자열로 통일.
// 구간(range) 이벤트 — startDate·endDate 둘 다 포함(inclusive). 하루짜리는 startDate === endDate.
export const calendarEventSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  title: z.string(),
  color: z.string().optional(),
})

export type CalendarEvent = z.infer<typeof calendarEventSchema>
