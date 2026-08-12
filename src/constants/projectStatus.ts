import type { ProjectStatus } from '../types/project'

// BE ProjectStatus enum 선언 순서(기획 중 → 편집 중 → 촬영 중[REVIEWING] → 완료)와 맞춘다.
// 이 순서 그대로 드롭다운에 노출되므로(Object.keys 사용), 실제 진행 순서와 다르게 두면 안 된다.
export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PREPARING: '기획 중',
  EDITING: '편집 중',
  SHOOTING: '촬영 중',
  COMPLETED: '완료',
}

export const PROJECT_STATUS_COLOR: Record<string, string> = {
  PREPARING: 'bg-tag-active-bg text-tag-active-text',
  EDITING: 'bg-tag-active-bg text-tag-active-text',
  SHOOTING: 'bg-tag-active-bg text-tag-active-text',
  COMPLETED: 'bg-tag-done-bg text-tag-done-text',
}

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABEL[status] ?? status
}

export function projectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLOR[status] ?? PROJECT_STATUS_COLOR.PREPARING
}

/** 실 BE는 아직 REVIEWING — FE 표기(SHOOTING/촬영중)는 그대로 두고 API 경계에서만 변환 */
export function toApiProjectStatus(status: ProjectStatus): ProjectStatus {
  return status === 'SHOOTING' ? 'REVIEWING' : status
}

export function fromApiProjectStatus(status: ProjectStatus): ProjectStatus {
  return status === 'REVIEWING' ? 'SHOOTING' : status
}
