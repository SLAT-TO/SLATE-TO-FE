import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getProjectMembers } from '../api/projects'
import { ApiError } from '../types/api'
import type { MemberSummary, ProjectDetailResponse } from '../types/project'
import type { ProjectNoticeListItem } from '../types/notice'
import { projectKeys } from '../queries/keys'
import {
  useProjectActivitiesQuery,
  useProjectMembersQuery,
  useProjectNoticesQuery,
  useProjectQuery,
} from '../queries/projects'

export function useProjectDetail(projectId: number) {
  const queryClient = useQueryClient()
  const projectQuery = useProjectQuery(projectId)
  const membersQuery = useProjectMembersQuery(projectId)
  const noticesQuery = useProjectNoticesQuery(projectId)
  const activitiesQuery = useProjectActivitiesQuery(projectId)

  const setProject: Dispatch<SetStateAction<ProjectDetailResponse | null>> = useCallback(
    (update) => {
      queryClient.setQueryData<ProjectDetailResponse>(projectKeys.detail(projectId), (prev) => {
        const current = prev ?? null
        const next = typeof update === 'function' ? update(current) : update
        return next ?? undefined
      })
    },
    [projectId, queryClient],
  )

  const setMembers: Dispatch<SetStateAction<MemberSummary[]>> = useCallback(
    (update) => {
      queryClient.setQueryData<MemberSummary[]>(projectKeys.members(projectId), (prev) => {
        const current = prev ?? []
        return typeof update === 'function' ? update(current) : update
      })
    },
    [projectId, queryClient],
  )

  const setNotices: Dispatch<SetStateAction<ProjectNoticeListItem[]>> = useCallback(
    (update) => {
      queryClient.setQueryData<ProjectNoticeListItem[]>(projectKeys.notices(projectId), (prev) => {
        const current = prev ?? []
        return typeof update === 'function' ? update(current) : update
      })
    },
    [projectId, queryClient],
  )

  const reloadMembers = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: projectKeys.members(projectId),
      queryFn: async () => {
        const page = await getProjectMembers(projectId)
        return page.items
      },
    })
  }, [projectId, queryClient])

  const partialErrors: string[] = []
  if (activitiesQuery.isError) partialErrors.push('최근 활동을 불러오지 못했습니다.')
  if (noticesQuery.isError) partialErrors.push('공지를 불러오지 못했습니다.')
  if (membersQuery.isError) partialErrors.push('참여 인원을 불러오지 못했습니다.')

  // 캐시가 있으면 재조회 실패로 화면 전체를 내리지 않음
  const error =
    projectQuery.isError && !projectQuery.data
      ? projectQuery.error instanceof ApiError
        ? projectQuery.error.message
        : '프로젝트 정보를 불러오지 못했습니다.'
      : null
  if (projectQuery.isError && projectQuery.data) {
    partialErrors.push('프로젝트 정보를 새로고침하지 못했습니다.')
  }

  return {
    project: projectQuery.data ?? null,
    setProject,
    members: membersQuery.data ?? [],
    setMembers,
    reloadMembers,
    activities: activitiesQuery.data ?? [],
    notices: noticesQuery.data ?? [],
    setNotices,
    loading: projectQuery.isPending && !projectQuery.data,
    error,
    partialErrors,
  }
}
