/** 온보딩 1단계 — 활동 역할 */
export const ONBOARDING_ROLE_LABELS = ['감독(연출)', '편집', '촬영', '음향', 'PD', '미술'] as const

export type OnboardingRole = (typeof ONBOARDING_ROLE_LABELS)[number]

export const ONBOARDING_ROLE_OPTIONS: ReadonlyArray<{ value: OnboardingRole; label: string }> =
  ONBOARDING_ROLE_LABELS.map((label) => ({ value: label, label }))
