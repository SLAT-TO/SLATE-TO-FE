/** 온보딩·프로필 — 역할 카테고리 */
export const ROLE_LABELS = [
  '연출',
  'PD',
  '촬영',
  '편집',
  '미술',
  '사운드',
  '작가',
  '조명',
  '배우',
  '기타',
] as const

export type Role = (typeof ROLE_LABELS)[number]

export const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> = ROLE_LABELS.map(
  (label) => ({ value: label, label }),
)
