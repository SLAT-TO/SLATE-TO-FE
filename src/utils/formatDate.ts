import { format } from 'date-fns'

// 날짜 문자열 변환 (없으면 placeholder)
export function formatDate(date?: Date) {
  return date ? format(date, 'yyyy.MM.dd') : '날짜를 선택해주세요'
}
