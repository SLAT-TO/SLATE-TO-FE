import type { ProjectStatus } from '../types/project'

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PREPARING: '준비중',
  IN_PROGRESS: '진행중',
  DONE: '진행 완료',
  ON_HOLD: '보류',
}

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABEL[status] ?? status
}
