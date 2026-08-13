import { useMemo } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
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
import type {
  CreateProjectRequest,
  ProjectDetailResponse,
  ProjectListResponse,
  ProjectSummary,
} from '../types/project'
import { projectKeys } from './keys'

export function useProjectsQuery() {
  const query = useInfiniteQuery({
    queryKey: projectKeys.list(),
    initialPageParam: null as number | null,
    queryFn: ({ pageParam }) =>
      getProjects({
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.nextCursor == null) return undefined
      return lastPage.nextCursor
    },
  })

  const projects = useMemo(
    () => sortProjectsByPin(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data],
  )

  return { ...query, projects }
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
  const query = useInfiniteQuery({
    queryKey: projectKeys.notices(projectId),
    initialPageParam: null as number | null,
    queryFn: ({ pageParam }) =>
      getProjectNotices(projectId, { cursor: pageParam ?? undefined, size: 20 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.nextCursor == null) return undefined
      return lastPage.nextCursor
    },
    retry: false,
  })

  const notices = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  )

  return { ...query, notices }
}

export function useProjectActivitiesQuery(projectId: number) {
  const query = useInfiniteQuery({
    queryKey: projectKeys.activities(projectId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getProjectActivities(projectId, { cursor: pageParam ?? undefined, size: 5 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.nextCursor == null) return undefined
      return lastPage.nextCursor
    },

    // 활동 목록은 첫 5건만 조회하고, 사용자가 더 보기를 선택할 때 다음 페이지를 불러온다.
    retry: false,
  })

  const activities = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  )

  return { ...query, activities }
}

/** 완료된 프로젝트는 핀 여부와 무관하게 맨 아래로, 나머지는 핀한 프로젝트를 상단으로
 * (pinnedAt 최신 우선) — 북마크가 위로 올라오는 것의 반대로 완료는 아래로 내려간다. */
function sortProjectsByPin(items: ProjectSummary[]): ProjectSummary[] {
  return [...items].sort((a, b) => {
    const aCompleted = a.status === 'COMPLETED'
    const bCompleted = b.status === 'COMPLETED'
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1

    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    const aPinned = a.pinnedAt ? Date.parse(a.pinnedAt) : 0
    const bPinned = b.pinnedAt ? Date.parse(b.pinnedAt) : 0
    if (aPinned !== bPinned) return bPinned - aPinned
    return b.id - a.id
  })
}

function patchListItem(
  data: InfiniteData<ProjectListResponse> | undefined,
  projectId: number,
  patch: Partial<ProjectSummary>,
): InfiniteData<ProjectListResponse> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((project) =>
        project.id === projectId ? { ...project, ...patch } : project,
      ),
    })),
  }
}

function removeListItem(
  data: InfiniteData<ProjectListResponse> | undefined,
  projectId: number,
): InfiniteData<ProjectListResponse> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((project) => project.id !== projectId),
    })),
  }
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

      const previousList = queryClient.getQueryData<InfiniteData<ProjectListResponse>>(
        projectKeys.list(),
      )
      const previousDetail = queryClient.getQueryData<ProjectDetailResponse>(
        projectKeys.detail(projectId),
      )

      const pinnedAt = next ? new Date().toISOString() : null
      queryClient.setQueryData<InfiniteData<ProjectListResponse>>(projectKeys.list(), (prev) =>
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
      queryClient.setQueryData<InfiniteData<ProjectListResponse>>(projectKeys.list(), (prev) =>
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
      queryClient.setQueryData<InfiniteData<ProjectListResponse>>(projectKeys.list(), (prev) =>
        removeListItem(prev, projectId),
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
      queryClient.setQueryData<InfiniteData<ProjectListResponse>>(projectKeys.list(), (prev) =>
        removeListItem(prev, projectId),
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
