import type { Feedback } from '../../types/feedback'

export function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function formatFeedbackTime(feedback: Pick<Feedback, 'startTime' | 'endTime'>): string {
  if (feedback.startTime === null) return ''
  if (feedback.endTime === null) return formatTimestamp(feedback.startTime)
  return `${formatTimestamp(feedback.startTime)} ~ ${formatTimestamp(feedback.endTime)}`
}

/** 작성 중인 피드백/답글에 첨부된(아직 전송 전) 시간 — 없으면 null */
export function formatPendingTime(start: number | null, end: number | null): string | null {
  if (end !== null) return formatFeedbackTime({ startTime: start, endTime: end })
  if (start !== null) return formatTimestamp(start)
  return null
}
