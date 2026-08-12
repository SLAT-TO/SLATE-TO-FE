/** 워크스페이스·프로젝트 도메인 query key */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (projectId: number) => [...projectKeys.details(), projectId] as const,
  members: (projectId: number) => [...projectKeys.detail(projectId), 'members'] as const,
  notices: (projectId: number) => [...projectKeys.detail(projectId), 'notices'] as const,
  activities: (projectId: number) => [...projectKeys.detail(projectId), 'activities'] as const,
}

/** 홈 대시보드 도메인 query key (오늘 브리핑·오늘 일정) */
export const homeKeys = {
  briefing: (date: string) => ['home', 'briefing', date] as const,
  todaySchedules: (date: string) => ['home', 'todaySchedules', date] as const,
}

/** 알림 도메인 query key */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
}
