import { format } from 'date-fns'

// 날짜 문자열 변환 (없으면 placeholder)
export function formatDate(date?: Date) {
  return date ? format(date, 'yyyy.MM.dd') : '날짜를 선택해주세요'
}

/** ISO 8601 문자열 → "2026년 8월 10일 20:19" */
export function formatDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return format(date, 'yyyy년 M월 d일 HH:mm')
}
