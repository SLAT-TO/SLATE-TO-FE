import { useEffect, useState } from 'react'
import { getDailySchedules, getTodayBriefing } from '../api/schedules'
import { useProjectsQuery } from '../queries/projects'
import { ApiError } from '../types/api'
import type { ProjectSummary } from '../types/project'
import type { ScheduleDailyItem, TodayBriefing } from '../types/schedule'
import { toDateKey } from '../utils/calendarUtils'

/** 홈 화면에 카드로 보여줄 진행 중인 프로젝트 개수 */
const HOME_PROJECT_LIMIT = 4

/** 완료(COMPLETED) 프로젝트보다 진행 중인 프로젝트를 우선 노출 */
function sortByInProgressFirst(projects: ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort((a, b) => {
    const aDone = a.status === 'COMPLETED' ? 1 : 0
    const bDone = b.status === 'COMPLETED' ? 1 : 0
    return aDone - bDone
  })
}

export function useHomeDashboard() {
  const projectsQuery = useProjectsQuery()
  const [briefing, setBriefing] = useState<TodayBriefing | null>(null)
  const [todaySchedules, setTodaySchedules] = useState<ScheduleDailyItem[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setDashboardLoading(true)
      setError(null)
      try {
        const todayKey = toDateKey(new Date())
        const [briefingResult, dailyResult] = await Promise.all([
          getTodayBriefing().catch(() => null),
          getDailySchedules(todayKey).catch(() => ({
            date: todayKey,
            items: [] as ScheduleDailyItem[],
          })),
        ])
        if (cancelled) return

        setBriefing(briefingResult)
        setTodaySchedules(dailyResult.items)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '홈 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setDashboardLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const projectError = projectsQuery.error
  const projectsError =
    projectsQuery.isError && !projectsQuery.data
      ? projectError instanceof ApiError
        ? projectError.message
        : '프로젝트 목록을 불러오지 못했습니다.'
      : null

  return {
    projects: sortByInProgressFirst(projectsQuery.projects).slice(0, HOME_PROJECT_LIMIT),
    briefing,
    todaySchedules,
    loading: dashboardLoading || (projectsQuery.isPending && !projectsQuery.data),
    error: error ?? projectsError,
  }
}
