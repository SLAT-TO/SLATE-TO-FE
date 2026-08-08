import type { UserRole } from '../types/user'

/** BE RoleName 기준 */
export const ROLE_OPTIONS: ReadonlyArray<{ value: UserRole; label: string }> = [
  { value: 'DIRECTOR', label: '연출' },
  { value: 'PD', label: 'PD' },
  { value: 'CINEMATOGRAPHER', label: '촬영' },
  { value: 'EDITOR', label: '편집' },
  { value: 'ART', label: '미술' },
  { value: 'SOUND', label: '사운드' },
  { value: 'WRITER', label: '작가' },
  { value: 'LIGHTING', label: '조명' },
  { value: 'ACTOR', label: '배우' },
  { value: 'ETC', label: '기타' },
]

/** 온보딩 1단계 — 기타(ETC) 제외 */
export const ONBOARDING_ROLE_OPTIONS: ReadonlyArray<{ value: UserRole; label: string }> = [
  { value: 'DIRECTOR', label: '연출' },
  { value: 'PD', label: 'PD' },
  { value: 'CINEMATOGRAPHER', label: '촬영' },
  { value: 'ART', label: '미술' },
  { value: 'SOUND', label: '사운드' },
  { value: 'WRITER', label: '작가' },
  { value: 'ACTOR', label: '배우' },
  { value: 'EDITOR', label: '편집' },
  { value: 'LIGHTING', label: '조명' },
]

export const ROLE_LABELS = ROLE_OPTIONS.map((o) => o.label)

export type Role = (typeof ROLE_LABELS)[number]

export function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role
}
