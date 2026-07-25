import type { ProjectStatus } from '../types/project'

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PREPARING: '준비중',
  IN_PROGRESS: '진행중',
  DONE: '진행 완료',
  ON_HOLD: '보류',
}

export const PROJECT_STATUS_COLOR: Record<string, string> = {
  PREPARING: 'bg-info-light text-info-dark',
  IN_PROGRESS: 'bg-success-light text-success-dark',
  DONE: 'bg-neutral-3 text-neutral-8',
  ON_HOLD: 'bg-caution-light text-caution-dark',
}

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABEL[status] ?? status
}

export function projectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLOR[status] ?? PROJECT_STATUS_COLOR.PREPARING
}
