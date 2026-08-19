import type { VideoProgressStatus } from '../types/video'

/** 영상 자체의 진행 상태 — 프로젝트 상태(PREPARING/EDITING/REVIEWING/COMPLETED)와는 별개다.
 * BE에 아직 이 값을 바꾸는 API가 없어(2026-08-19 기준 스웨거 확인) 우선 진행중/완료 두 값만 쓴다. */
export const VIDEO_PROGRESS_STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: '진행중',
  DONE: '완료',
}

export const VIDEO_PROGRESS_STATUS_VALUES: VideoProgressStatus[] = ['IN_PROGRESS', 'DONE']

export function videoProgressStatusLabel(status: VideoProgressStatus): string {
  return VIDEO_PROGRESS_STATUS_LABEL[status] ?? status
}
