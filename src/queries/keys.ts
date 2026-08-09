/** 워크스페이스·프로젝트 도메인 query key */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (projectId: number) => [...projectKeys.details(), projectId] as const,
  members: (projectId: number) => [...projectKeys.detail(projectId), 'members'] as const,
  notices: (projectId: number) => [...projectKeys.detail(projectId), 'notices'] as const,
  activities: (projectId: number, size?: number) =>
    size == null
      ? ([...projectKeys.detail(projectId), 'activities'] as const)
      : ([...projectKeys.detail(projectId), 'activities', { size }] as const),
}
