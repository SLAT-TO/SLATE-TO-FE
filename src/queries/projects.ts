import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  deleteProject,
  getProject,
  getProjectActivities,
  getProjectMembers,
  getProjectNotices,
  getProjects,
  leaveProject,
  pinProject,
  unpinProject,
} from '../api/projects'
import type { CreateProjectRequest, ProjectDetailResponse, ProjectSummary } from '../types/project'
import { projectKeys } from './keys'

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      const result = await getProjects()
      return sortProjectsByPin(result.items)
    },
  })
}

export function useProjectQuery(projectId: number) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
  })
}

export function useProjectMembersQuery(projectId: number) {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: async () => {
      const result = await getProjectMembers(projectId)
      return result.items
    },
    retry: false,
  })
}

export function useProjectNoticesQuery(projectId: number) {
  return useQuery({
    queryKey: projectKeys.notices(projectId),
    queryFn: async () => {
      const result = await getProjectNotices(projectId)
      return result.items
    },
    retry: false,
  })
}

export function useProjectActivitiesQuery(projectId: number, size = 5) {
  return useQuery({
    queryKey: projectKeys.activities(projectId, size),
    queryFn: async () => {
      let result = await getProjectActivities(projectId, { size })
      const items = [...result.items]

      // 활동 목록 화면은 전체 이력을 보여준다. 카드/미리보기의 단건·5건 조회는 한 페이지만 사용한다.
      while (size === 100 && result.hasNext && result.nextCursor) {
        result = await getProjectActivities(projectId, { cursor: result.nextCursor, size })
        items.push(...result.items)
      }

      return items
    },
    retry: false,
  })
}

/** 핀한 프로젝트를 목록 상단으로 (pinnedAt 최신 우선) */
function sortProjectsByPin(items: ProjectSummary[]): ProjectSummary[] {
  return [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    const aPinned = a.pinnedAt ? Date.parse(a.pinnedAt) : 0
    const bPinned = b.pinnedAt ? Date.parse(b.pinnedAt) : 0
    if (aPinned !== bPinned) return bPinned - aPinned
    return b.id - a.id
  })
}

function patchListItem(
  items: ProjectSummary[] | undefined,
  projectId: number,
  patch: Partial<ProjectSummary>,
): ProjectSummary[] | undefined {
  if (!items) return items
  return sortProjectsByPin(items.map((p) => (p.id === projectId ? { ...p, ...patch } : p)))
}

export function useToggleProjectPinMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, next }: { projectId: number; next: boolean }) => {
      const result = next ? await pinProject(projectId) : await unpinProject(projectId)
      return { projectId, ...result }
    },
    onMutate: async ({ projectId, next }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list() })
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) })

      const previousList = queryClient.getQueryData<ProjectSummary[]>(projectKeys.list())
      const previousDetail = queryClient.getQueryData<ProjectDetailResponse>(
        projectKeys.detail(projectId),
      )

      const pinnedAt = next ? new Date().toISOString() : null
      queryClient.setQueryData<ProjectSummary[]>(projectKeys.list(), (prev) =>
        patchListItem(prev, projectId, { isPinned: next, pinnedAt }),
      )
      queryClient.setQueryData<ProjectDetailResponse>(projectKeys.detail(projectId), (prev) =>
        prev ? { ...prev, isPinned: next, pinnedAt } : prev,
      )

      return { previousList, previousDetail, projectId }
    },
    onError: (_err, _vars, context) => {
      if (!context) return
      if (context.previousList) {
        queryClient.setQueryData(projectKeys.list(), context.previousList)
      }
      if (context.previousDetail) {
        queryClient.setQueryData(projectKeys.detail(context.projectId), context.previousDetail)
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<ProjectSummary[]>(projectKeys.list(), (prev) =>
        patchListItem(prev, result.projectId, {
          isPinned: result.isPinned,
          pinnedAt: result.pinnedAt,
        }),
      )
      queryClient.setQueryData<ProjectDetailResponse>(
        projectKeys.detail(result.projectId),
        (prev) => (prev ? { ...prev, isPinned: result.isPinned, pinnedAt: result.pinnedAt } : prev),
      )
    },
    onSettled: (_data, _err, vars) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.list() })
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(vars.projectId) })
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.setQueryData<ProjectSummary[]>(projectKeys.list(), (prev) =>
        prev?.filter((p) => p.id !== projectId),
      )
      void queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useLeaveProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: number) => leaveProject(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.setQueryData<ProjectSummary[]>(projectKeys.list(), (prev) =>
        prev?.filter((p) => p.id !== projectId),
      )
      void queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProjectRequest) => createProject(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
