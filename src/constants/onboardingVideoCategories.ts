/** 온보딩 3단계 — 활동 영상 카테고리 */
export const ONBOARDING_VIDEO_CATEGORY_LABELS = [
  '영화',
  '다큐/시사/교양',
  '드라마',
  '뮤직비디오',
  '예능/오락',
  '광고/이벤트/홍보영상',
] as const

export type OnboardingVideoCategory = (typeof ONBOARDING_VIDEO_CATEGORY_LABELS)[number]

export const ONBOARDING_VIDEO_CATEGORY_OPTIONS: ReadonlyArray<{
  value: OnboardingVideoCategory
  label: string
}> = ONBOARDING_VIDEO_CATEGORY_LABELS.map((label) => ({ value: label, label }))
