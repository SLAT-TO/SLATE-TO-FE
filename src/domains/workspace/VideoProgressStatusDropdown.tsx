import type { VideoProgressStatus } from '../../types/video'
import {
  VIDEO_PROGRESS_STATUS_LABEL,
  VIDEO_PROGRESS_STATUS_VALUES,
  videoProgressStatusLabel,
} from '../../constants/videoProgressStatus'

type VideoProgressStatusDropdownProps = {
  status: VideoProgressStatus
  onChange: (status: VideoProgressStatus) => void
}

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: 'bg-tag-active-bg text-tag-active-text',
  DONE: 'bg-tag-done-bg text-tag-done-text',
}

/** 영상 카드에서 진행중/완료를 직접 고르는 드롭다운.
 * BE에 영상 진행 상태 변경 API가 아직 없어 우선 로컬 상태에만 반영한다 —
 * API가 추가되면 onChange 호출부(VideoFeedbackTab)에서 실제 요청을 붙이면 된다. */
export default function VideoProgressStatusDropdown({
  status,
  onChange,
}: VideoProgressStatusDropdownProps) {
  const hasKnownStatus = (VIDEO_PROGRESS_STATUS_VALUES as string[]).includes(status)

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">영상 진행 상태</span>
      <select
        value={status}
        onChange={(event) => onChange(event.target.value as VideoProgressStatus)}
        className={`text-caption-sm cursor-pointer appearance-none rounded-[3px] py-1 pr-8 pl-[19px] font-semibold focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none ${
          STATUS_COLOR[status] ?? STATUS_COLOR.IN_PROGRESS
        }`}
      >
        {!hasKnownStatus && <option value={status}>{videoProgressStatusLabel(status)}</option>}
        {VIDEO_PROGRESS_STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {VIDEO_PROGRESS_STATUS_LABEL[value]}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute right-3 size-3"
      >
        <path
          d="M2.5 4.5L6 8l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  )
}
