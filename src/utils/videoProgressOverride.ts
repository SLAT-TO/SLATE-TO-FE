import type { VideoProgressStatus } from '../types/video'
import { VIDEO_PROGRESS_STATUS_VALUES } from '../constants/videoProgressStatus'

const videoProgressKey = (videoId: number) => `slate_video_progress_override:${videoId}`

/** BE에 영상 진행 상태를 저장하는 API가 아직 없어, 새로고침해도 유지되도록 우선 로컬에 저장한다.
 * API가 추가되면 이 파일을 지우고 VideoFeedbackTab에서 실제 요청으로 교체하면 된다. */
export function getVideoProgressOverride(videoId: number): VideoProgressStatus | null {
  const value = localStorage.getItem(videoProgressKey(videoId))
  if (value && (VIDEO_PROGRESS_STATUS_VALUES as string[]).includes(value)) {
    return value as VideoProgressStatus
  }
  return null
}

export function setVideoProgressOverride(videoId: number, status: VideoProgressStatus): void {
  localStorage.setItem(videoProgressKey(videoId), status)
}
