import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { getProjectMembers } from '../api/projects'
import { ApiError } from '../types/api'
import type { CursorPage, MemberSummary, ProjectDetailResponse } from '../types/project'
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

  // notices는 useInfiniteQuery 캐시(페이지 배열)라, 평평한 배열을 기대하는 기존 setNotices 시그니처를
  // 유지하려고 페이지 경계는 그대로 두고 내용물만 첫 페이지에 몰아 넣는다 — 다음 페이지의
  // nextCursor/hasNext는 건드리지 않으므로 이후 loadMoreNotices는 계속 정상 동작한다.
  const setNotices: Dispatch<SetStateAction<ProjectNoticeListItem[]>> = useCallback(
    (update) => {
      queryClient.setQueryData<InfiniteData<CursorPage<ProjectNoticeListItem>>>(
        projectKeys.notices(projectId),
        (prev) => {
          if (!prev) return prev
          const current = prev.pages.flatMap((page) => page.items)
          const next = typeof update === 'function' ? update(current) : update
          let offset = 0
          return {
            ...prev,
            pages: prev.pages.map((page) => {
              const items = next.slice(offset, offset + page.items.length)
              offset += page.items.length
              return {
              ...page,
                items,
              }
            }),
          }
        },
      )
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

  // 최근 활동 실패는 빈 목록으로 취급 (빨간 문구·alert 없음). 공지/멤버만 soft alert.
  const partialErrors: string[] = []
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
    activities: activitiesQuery.activities,
    hasMoreActivities: activitiesQuery.hasNextPage,
    loadMoreActivities: activitiesQuery.fetchNextPage,
    isLoadingMoreActivities: activitiesQuery.isFetchingNextPage,
    notices: noticesQuery.notices,
    setNotices,
    hasMoreNotices: noticesQuery.hasNextPage,
    loadMoreNotices: noticesQuery.fetchNextPage,
    isLoadingMoreNotices: noticesQuery.isFetchingNextPage,
    loading: projectQuery.isPending && !projectQuery.data,
    error,
    partialErrors,
  }
}
