import { useQuery } from '@tanstack/react-query'
import { getDailySchedules, getTodayBriefing } from '../api/schedules'
import { toDateKey } from '../utils/calendarUtils'
import { homeKeys } from './keys'

export function useTodayBriefingQuery() {
  const dateKey = toDateKey(new Date())
  return useQuery({
    queryKey: homeKeys.briefing(dateKey),
    // 브리핑이 없거나 실패해도 홈 화면 전체를 에러로 내리지 않고 빈 상태로 취급
    queryFn: () => getTodayBriefing().catch(() => null),
  })
}

export function useTodaySchedulesQuery() {
  const dateKey = toDateKey(new Date())
  return useQuery({
    queryKey: homeKeys.todaySchedules(dateKey),
    queryFn: () => getDailySchedules(dateKey).catch(() => ({ date: dateKey, items: [] })),
  })
}
