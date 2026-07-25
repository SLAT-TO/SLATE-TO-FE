export type VideoProgressStatus = 'IN_PROGRESS' | 'DONE' | string

export type VideoListItem = {
  videoId: number
  title: string
  thumbnailUrl: string | null
  bookmarked: boolean
  progressStatus: VideoProgressStatus
  unreadCommentCount: number
  updatedAt: string
}

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
  categories: string[]
  createdAt: string
  updatedAt: string
}

export type VideoListResult = {
  items: VideoListItem[]
  nextCursor: number | null
  hasNext: boolean
}

export type CreateVideoRequest = {
  youtubeUrl: string
  title: string
  memo?: string
}

export type CreateVideoResult = {
  videoId: number
  title: string
  thumbnailUrl: string | null
  bookmarked: boolean
  progressStatus: VideoProgressStatus
  commentCount: number
  createdAt: string
}

export type BookmarkVideoRequest = {
  bookmarked: boolean
}

export type BookmarkVideoResult = {
  videoId: number
  bookmarked: boolean
  message: string
}

export type ValidateYoutubeRequest = {
  youtubeUrl: string
  projectId: number
}

export type ValidateYoutubeResult = {
  valid: boolean
  youtubeVideoId: string
  title: string
  thumbnailUrl: string
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
