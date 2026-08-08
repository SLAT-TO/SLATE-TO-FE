import { useCallback, useEffect, useState } from 'react'
import { deleteProject, getProjects, leaveProject, pinProject, unpinProject } from '../api/projects'
import { getTodayBriefing, getSchedules } from '../api/schedules'
import { ApiError } from '../types/api'
import type { ProjectSummary } from '../types/project'
import type { Schedule, TodayBriefing } from '../types/schedule'
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

        setProjects(sortByInProgressFirst(projectList.items).slice(0, HOME_PROJECT_LIMIT))
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

  const togglePin = useCallback(async (project: ProjectSummary) => {
    const next = !project.isPinned
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, isPinned: next } : p)))
    try {
      const result = next ? await pinProject(project.id) : await unpinProject(project.id)
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPinned: result.isPinned } : p)),
      )
    } catch {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, isPinned: !next } : p)))
    }
  }, [])

  const removeProject = useCallback(async (projectId: number) => {
    await deleteProject(projectId)
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }, [])

  const leaveCurrentProject = useCallback(async (projectId: number) => {
    await leaveProject(projectId)
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }, [])

  return {
    projects,
    briefing,
    todaySchedules,
    loading,
    error,
    togglePin,
    removeProject,
    leaveProject: leaveCurrentProject,
  }
}
