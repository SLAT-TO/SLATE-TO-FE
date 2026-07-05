import { addDays, eachDayOfInterval, format, startOfMonth, startOfWeek } from 'date-fns'

// 월요일 시작 (일요일 시작이면 weekStartsOn: 0)
const WEEK_OPTIONS = { weekStartsOn: 1 } as const

// 해당 달의 달력 그리드를 만든다.
// 앞뒤 달의 날짜까지 채워서 항상 주 단위(7칸 배수)로 떨어지게 함.
export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), WEEK_OPTIONS)
  const end = addDays(start, 41) // 시작일부터 42칸(6주)
  return eachDayOfInterval({ start, end })
}

// 이벤트 매칭용 키. events의 date 형식과 동일해야 함.
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
