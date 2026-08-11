const DAY_END_TIME = 'T23:59:59.999'

/**
 * 프로젝트 생성 시각부터 마감일 종료 시각까지의 경과 비율을 0~100으로 계산한다.
 * 마감일이 없거나 날짜 형식이 올바르지 않으면 진행률을 표시하지 않는다.
 */
export function calculateProjectDeadlineProgress(
  createdAt: string,
  endDate: string | null,
  now = new Date(),
): number | undefined {
  if (!endDate) return undefined

  const datePart = endDate.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return undefined

  const start = new Date(createdAt)
  const deadline = new Date(`${datePart}${DAY_END_TIME}`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(deadline.getTime())) return undefined

  const nowTime = now.getTime()
  const startTime = start.getTime()
  const deadlineTime = deadline.getTime()

  if (deadlineTime <= startTime) return nowTime >= deadlineTime ? 100 : 0
  if (nowTime <= startTime) return 0
  if (nowTime >= deadlineTime) return 100

  return Math.round(((nowTime - startTime) / (deadlineTime - startTime)) * 100)
}
