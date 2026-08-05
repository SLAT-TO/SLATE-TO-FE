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
      return result.items
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

export function useProjectActivitiesQuery(projectId: number) {
  return useQuery({
    queryKey: projectKeys.activities(projectId),
    queryFn: async () => {
      const result = await getProjectActivities(projectId)
      return result.items
    },
    retry: false,
  })
}

function patchListItem(
  items: ProjectSummary[] | undefined,
  projectId: number,
  patch: Partial<ProjectSummary>,
): ProjectSummary[] | undefined {
  if (!items) return items
  return items.map((p) => (p.id === projectId ? { ...p, ...patch } : p))
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

      queryClient.setQueryData<ProjectSummary[]>(projectKeys.list(), (prev) =>
        patchListItem(prev, projectId, { isPinned: next }),
      )
      queryClient.setQueryData<ProjectDetailResponse>(projectKeys.detail(projectId), (prev) =>
        prev ? { ...prev, isPinned: next } : prev,
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
