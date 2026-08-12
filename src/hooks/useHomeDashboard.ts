import { useMemo } from 'react'
import {
  useDeleteProjectMutation,
  useLeaveProjectMutation,
  useProjectsQuery,
  useToggleProjectPinMutation,
} from '../queries/projects'
import { useTodayBriefingQuery, useTodaySchedulesQuery } from '../queries/home'
import { ApiError } from '../types/api'
import type { ProjectSummary } from '../types/project'

/** 홈 화면에 카드로 보여줄 진행 중인 프로젝트 개수 */
const HOME_PROJECT_LIMIT = 4

/** 완료 프로젝트보다 진행 중인 프로젝트를 우선 노출한다. */
function sortByInProgressFirst(projects: ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort((a, b) => {
    const aDone = a.status === 'COMPLETED' ? 1 : 0
    const bDone = b.status === 'COMPLETED' ? 1 : 0
    return aDone - bDone
  })
}

export function useHomeDashboard() {
  // 워크스페이스 목록과 같은 캐시(projectKeys.list())를 공유 — 홈↔워크스페이스 이동 시 재요청 없이 재사용된다
  const projectsQuery = useProjectsQuery()
  const briefingQuery = useTodayBriefingQuery()
  const todaySchedulesQuery = useTodaySchedulesQuery()
  const pinMutation = useToggleProjectPinMutation()
  const deleteMutation = useDeleteProjectMutation()
  const leaveMutation = useLeaveProjectMutation()

  const projects = useMemo(
    () => sortByInProgressFirst(projectsQuery.projects).slice(0, HOME_PROJECT_LIMIT),
    [projectsQuery.projects],
  )

  const togglePin = (project: ProjectSummary) => {
    pinMutation.mutate({ projectId: project.id, next: !project.isPinned })
  }

  const removeProject = async (projectId: number) => {
    await deleteMutation.mutateAsync(projectId)
  }

  const leaveProject = async (projectId: number) => {
    await leaveMutation.mutateAsync(projectId)
  }

  const loading =
    projectsQuery.isPending || briefingQuery.isPending || todaySchedulesQuery.isPending

  const error = projectsQuery.isError
    ? projectsQuery.error instanceof ApiError
      ? projectsQuery.error.message
      : '홈 정보를 불러오지 못했습니다.'
    : null

  return {
    projects,
    briefing: briefingQuery.data ?? null,
    todaySchedules: todaySchedulesQuery.data?.items ?? [],
    loading,
    error,
    togglePin,
    removeProject,
    leaveProject,
  }
}
