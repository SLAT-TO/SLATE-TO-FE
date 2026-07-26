/** 온보딩·프로필 — 주요 활동 지역 */
export const ONBOARDING_REGION_LABELS = [
  '서울시',
  '경기도',
  '강원도',
  '충청남도',
  '충청북도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주도',
  '전국',
] as const

export type Region = (typeof ONBOARDING_REGION_LABELS)[number]

export const ONBOARDING_REGION_OPTIONS: ReadonlyArray<{ value: Region; label: string }> =
  ONBOARDING_REGION_LABELS.map((label) => ({
    value: label,
    label,
  }))
