/** 영상 피드백 댓글 — 피드백 유형 */
export const FEEDBACK_TYPE_LABELS = [
  '영상',
  '자막',
  '음향',
  '색보정',
  '그래픽 / 모션',
  '기타',
] as const

export type FeedbackType = (typeof FEEDBACK_TYPE_LABELS)[number]

export const FEEDBACK_TYPE_OPTIONS: ReadonlyArray<{ value: FeedbackType; label: string }> =
  FEEDBACK_TYPE_LABELS.map((label) => ({ value: label, label }))
