import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
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
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeMenu = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [open])

  // 카드 전체가 클릭 시 영상 상세로 이동하는 링크라, 드롭다운 조작이 그 이동을 트리거하면 안 된다
  const stopCardClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }
  const stopCardKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation()
  }

  return (
    <div
      className="relative"
      ref={containerRef}
      onClick={stopCardClick}
      onKeyDown={stopCardKeyDown}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-caption-sm flex items-center gap-1 rounded-[3px] px-[19px] py-1 font-semibold ${
          STATUS_COLOR[status] ?? STATUS_COLOR.IN_PROGRESS
        }`}
      >
        {videoProgressStatusLabel(status)}
        <svg viewBox="0 0 12 12" fill="none" className="size-3">
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className="border-neutral-3 bg-bg-primary absolute top-full left-0 z-10 mt-1 w-24 rounded-lg border py-1 shadow-md">
          {VIDEO_PROGRESS_STATUS_VALUES.map((value) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  if (value !== status) onChange(value)
                }}
                className="hover:bg-neutral-2 text-caption-lg text-neutral-10 block w-full px-3 py-2 text-left"
              >
                {VIDEO_PROGRESS_STATUS_LABEL[value]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
