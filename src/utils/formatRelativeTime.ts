/** ISO 문자열을 "방금 전"/"N분 전"/"N시간 전"/"N일 전" 형태로 변환 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (60 * 1000))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}일 전`
}
