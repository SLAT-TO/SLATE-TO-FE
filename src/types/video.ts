export type VideoProgressStatus = 'IN_PROGRESS' | 'DONE' | string

/** BE VideoItemResDTO */
export type VideoListItem = {
  videoId: number
  title: string
  thumbnailUrl: string | null
  bookmarked: boolean
  progressStatus: VideoProgressStatus
  hasUnreadFeedback: boolean
  createdAt: string
  updatedAt: string
}

/** BE VideoDetailResDTO */
export type VideoDetail = {
  videoId: number
  projectId: number
  title: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string | null
  progressStatus: VideoProgressStatus
  bookmarked: boolean
  description: string | null
  memo: string | null
  projectTags: string[]
  createdAt: string
  updatedAt: string
}

/** BE GuestVideoDetailResDTO — 게스트는 projectId·bookmarked 없이 영상 자체 정보만 받는다 */
export type GuestVideoDetail = {
  videoId: number
  title: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string | null
  progressStatus: VideoProgressStatus
  description: string | null
  memo: string | null
  projectTags: string[]
  createdAt: string
  updatedAt: string
}

/** BE VideoListResDTO */
export type VideoListResult = {
  items: VideoListItem[]
  nextCursor: number | null
  hasNext: boolean
}

/** BE VideoCreateReqDTO */
export type CreateVideoRequest = {
  youtubeUrl: string
  title: string
  memo?: string
}

/** BE VideoCreateResDTO */
export type CreateVideoResult = {
  videoId: number
  title: string
  thumbnailUrl: string | null
  durationSeconds: number | null
  bookmarked: boolean
  progressStatus: VideoProgressStatus
  createdAt: string
}

/** BE VideoUpdateReqDTO — youtubeUrl은 FE 선반영, BE 필드 추가 필요 */
export type UpdateVideoRequest = {
  title?: string
  memo?: string
  youtubeUrl?: string
}

/** BE VideoUpdateResDTO — youtubeUrl은 BE 반영 전 optional */
export type UpdateVideoResult = {
  videoId: number
  title: string
  memo: string | null
  updatedAt: string
  youtubeUrl?: string
}

/** BE VideoBookmarkUpdateReqDTO / VideoBookmarkUpdateResDTO */
export type BookmarkVideoRequest = {
  bookmarked: boolean
}

export type BookmarkVideoResult = {
  videoId: number
  bookmarked: boolean
  message: string
}

/** BE YoutubeValidateReqDTO / YoutubeValidateResDTO */
export type ValidateYoutubeRequest = {
  youtubeUrl: string
  projectId: number
}

export type ValidateYoutubeResult = {
  valid: boolean
  youtubeVideoId: string
  title: string
  thumbnailUrl: string
  durationSeconds: number
  playable: boolean
  message: string
}

export type ReferenceFile = {
  referenceFileId: number
  /** 게스트 응답에는 없음(BE가 내부 파일 식별자를 노출하지 않음) — 팀원용 다운로드에만 쓰인다 */
  projectFileId?: number
  fileName: string
  contentType?: string
  fileSize?: number
  isFinal?: boolean
  /** 게스트 응답에는 없음 — 외부인에게 팀원 신원을 노출하지 않기 위해 제외 */
  uploader?: {
    id: number
    nickname: string
  }
  createdAt: string
}

/** BE VideoReferenceFileCreateResDTO */
export type LinkReferenceFileResult = {
  referenceFileId: number
  projectFileId: number
  createdAt: string
}
