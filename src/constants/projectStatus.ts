import type { ProjectStatus } from '../types/project'

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PREPARING: '준비중',
  EDITING: '편집중',
  REVIEWING: '검토중',
  COMPLETED: '완료',
}

export const PROJECT_STATUS_COLOR: Record<string, string> = {
  PREPARING: 'bg-info-light text-info-dark',
  EDITING: 'bg-success-light text-success-dark',
  REVIEWING: 'bg-caution-light text-caution-dark',
  COMPLETED: 'bg-neutral-3 text-neutral-8',
}

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABEL[status] ?? status
}

export function projectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLOR[status] ?? PROJECT_STATUS_COLOR.PREPARING
}
