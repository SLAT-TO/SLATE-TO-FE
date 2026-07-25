import { useEffect, useState } from 'react'
import { getProjects } from '../api/projects'
import { getTodayBriefing, getSchedules } from '../api/schedules'
import { ApiError } from '../types/api'
import type { ProjectSummary } from '../types/project'
import type { Schedule, TodayBriefing } from '../types/schedule'
import { toDateKey } from '../utils/calendarUtils'

/** 홈 화면에 카드로 보여줄 진행 중인 프로젝트 개수 */
const HOME_PROJECT_LIMIT = 2

export function useHomeDashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [briefing, setBriefing] = useState<TodayBriefing | null>(null)
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [projectList, briefingResult, scheduleResult] = await Promise.all([
          getProjects(),
          getTodayBriefing().catch(() => null),
          getSchedules().catch(() => ({ items: [] as Schedule[] })),
        ])
        if (cancelled) return

        const todayKey = toDateKey(new Date())

        setProjects(projectList.items.slice(0, HOME_PROJECT_LIMIT))
        setBriefing(briefingResult)
        setTodaySchedules(scheduleResult.items.filter((s) => s.startAt.slice(0, 10) === todayKey))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '홈 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { projects, briefing, todaySchedules, loading, error }
}
