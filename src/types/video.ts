export type VideoProgressStatus = 'IN_PROGRESS' | 'DONE' | string

/** BE VideoItemResDTO */
export type VideoListItem = {
  videoId: number
  title: string
  thumbnailUrl: string | null
  bookmarked: boolean
  progressStatus: VideoProgressStatus
  unreadCommentCount: number
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
  unreadCommentCount: number
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
  projectFileId: number
  fileName: string
  contentType: string
  fileSize: number
  isFinal: boolean
  createdAt: string
}
