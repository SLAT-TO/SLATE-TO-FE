import { addDays, eachDayOfInterval, startOfMonth, startOfWeek } from 'date-fns'

// 일요일 시작 6주(42일) 달력 그리드
export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end: addDays(start, 41) })
}
