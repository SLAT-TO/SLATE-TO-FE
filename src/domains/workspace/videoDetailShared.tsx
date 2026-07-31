import type { Feedback } from '../../types/feedback'
import { formatTimestamp } from './videoDetailFormat'

/** 피드백/답글에 첨부된 시간 표시 — 구간이면 시작/종료 지점을 각각 클릭해 그 지점으로 이동할 수 있게 분리 */
export function FeedbackTimeLink({
  feedback,
  onSeek,
  className,
}: {
  feedback: Pick<Feedback, 'startTime' | 'endTime'>
  onSeek: (seconds: number) => void
  className: string
}) {
  if (feedback.startTime === null) return null
  if (feedback.endTime === null) {
    return (
      <button type="button" onClick={() => onSeek(feedback.startTime!)} className={className}>
        {formatTimestamp(feedback.startTime)}
      </button>
    )
  }
  return (
    <span className={className}>
      <button type="button" onClick={() => onSeek(feedback.startTime!)}>
        {formatTimestamp(feedback.startTime)}
      </button>
      {' ~ '}
      <button type="button" onClick={() => onSeek(feedback.endTime!)}>
        {formatTimestamp(feedback.endTime)}
      </button>
    </span>
  )
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
export function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}
export function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M3 10v4h4l5 5V5L7 10H3zm12.59 2L18 9.59 19.41 11 17 13.41 19.41 15.83 18 17.24 15.59 14.83 13.17 17.24 11.76 15.83 14.17 13.41 11.76 11 13.17 9.59z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
    </svg>
  )
}
export function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  )
}
