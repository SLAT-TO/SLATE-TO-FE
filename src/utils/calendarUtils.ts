import { addDays, eachDayOfInterval, format, startOfMonth, startOfWeek } from 'date-fns'
import type { CalendarEvent } from '../schemas/calendarEvent'

// 월요일 시작 (일요일 시작이면 weekStartsOn: 0)
const WEEK_OPTIONS = { weekStartsOn: 1 } as const

// 해당 달의 달력 그리드를 만든다.
// 앞뒤 달의 날짜까지 채워서 항상 주 단위(7칸 배수)로 떨어지게 함.
export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), WEEK_OPTIONS)
  const end = addDays(start, 41) // 시작일부터 42칸(6주)
  return eachDayOfInterval({ start, end })
}

// 6주×7일 배열을 주 단위(7일씩)로 쪼갠다.
export function chunkWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

// 이벤트 매칭용 키. events의 startDate/endDate 형식과 동일해야 함.
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export interface PositionedEvent {
  event: CalendarEvent
  /** 0~6 (월~일), 주 안에서 바가 시작하는 컬럼 */
  startCol: number
  /** 몇 칸을 가로지르는지 */
  span: number
  /** 세로 위치 (0부터) */
  lane: number
}

// 한 주(week) 안에서 이벤트를 레인에 배치한다.
// 시작 컬럼 순 그리디 interval-scheduling: 정렬 후 비어있는 첫 레인에 배정.
// maxLanes를 넘는 이벤트는 positioned에서 빠지고, 걸치는 날짜마다 overflowByDay가 1씩 늘어난다.
export function assignEventLanes(
  weekDays: Date[],
  events: CalendarEvent[],
  maxLanes: number,
): { positioned: PositionedEvent[]; overflowByDay: Map<string, number> } {
  const weekStartKey = toDateKey(weekDays[0])
  const weekEndKey = toDateKey(weekDays[weekDays.length - 1])

  const segments = events
    .filter((event) => event.startDate <= weekEndKey && event.endDate >= weekStartKey)
    .map((event) => {
      const segStartKey = event.startDate > weekStartKey ? event.startDate : weekStartKey
      const segEndKey = event.endDate < weekEndKey ? event.endDate : weekEndKey
      const startCol = weekDays.findIndex((day) => toDateKey(day) === segStartKey)
      const endCol = weekDays.findIndex((day) => toDateKey(day) === segEndKey)
      return { event, startCol, span: endCol - startCol + 1 }
    })
    .sort((a, b) => a.startCol - b.startCol || a.span - b.span)

  // 레인별로 "다음 빈 컬럼"을 기록해두고, 시작 컬럼이 그 이상이면 그 레인에 배정
  const laneNextFreeCol: number[] = []
  const positioned: PositionedEvent[] = []
  const overflowByDay = new Map<string, number>()

  for (const seg of segments) {
    let lane = laneNextFreeCol.findIndex((freeCol) => freeCol <= seg.startCol)
    if (lane === -1) {
      lane = laneNextFreeCol.length
      laneNextFreeCol.push(0)
    }
    laneNextFreeCol[lane] = seg.startCol + seg.span

    if (lane < maxLanes) {
      positioned.push({ event: seg.event, startCol: seg.startCol, span: seg.span, lane })
    } else {
      for (let col = seg.startCol; col < seg.startCol + seg.span; col++) {
        const key = toDateKey(weekDays[col])
        overflowByDay.set(key, (overflowByDay.get(key) ?? 0) + 1)
      }
    }
  }

  return { positioned, overflowByDay }
}
