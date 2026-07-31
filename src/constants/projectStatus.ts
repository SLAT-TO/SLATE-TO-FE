import type { ProjectStatus } from '../types/project'

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PREPARING: '기획중',
  SHOOTING: '촬영중',
  EDITING: '편집중',
  COMPLETED: '완료',
}

export const PROJECT_STATUS_COLOR: Record<string, string> = {
  PREPARING: 'bg-tag-active-bg text-tag-active-text',
  SHOOTING: 'bg-tag-active-bg text-tag-active-text',
  EDITING: 'bg-tag-active-bg text-tag-active-text',
  COMPLETED: 'bg-tag-done-bg text-tag-done-text',
}

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABEL[status] ?? status
}

export function projectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLOR[status] ?? PROJECT_STATUS_COLOR.PREPARING
}
