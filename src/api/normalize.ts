import type { Feedback, FeedbackReply } from '../types/feedback'
import type { MeProfile } from '../types/user'
import type { VideoListItem, VideoListResult } from '../types/video'

/** 피드백/답글 status — BE·mock은 boolean, 구명세·일부 응답은 "Y"/"N" 문자열일 수 있음 */
export function toFeedbackStatus(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw
  if (raw === 'Y' || raw === 'y' || raw === 'true' || raw === 1 || raw === '1') return true
  if (raw === 'N' || raw === 'n' || raw === 'false' || raw === 0 || raw === '0') return false
  return false
}

/** wire 응답 — status는 boolean 또는 "Y"/"N" 등일 수 있음 */
export type FeedbackStatusRaw = Omit<Feedback, 'status'> & { status: unknown }
export type FeedbackReplyStatusRaw = Omit<FeedbackReply, 'status'> & { status: unknown }

export function normalizeFeedback(raw: FeedbackStatusRaw): Feedback {
  return { ...raw, status: toFeedbackStatus(raw.status) }
}

export function normalizeFeedbackReply(raw: FeedbackReplyStatusRaw): FeedbackReply {
  return { ...raw, status: toFeedbackStatus(raw.status) }
}

/** BE GET /users/me — region 필드, PATCH/공개프로필은 location */
export type BeMe = Omit<MeProfile, 'location'> & {
  region?: string | null
  location?: string | null
}

export type CursorPageResult<T> = {
  items: T[]
  nextCursor: number | string | null
  hasNext: boolean
}

/** mock 구형 `{ videos: [] }` 흡수용 */
export type BeVideoListRaw =
  | VideoListResult
  | CursorPageResult<VideoListItem>
  | { videos: VideoListItem[]; nextCursor: number | null; hasNext: boolean }

export function normalizeMe(raw: BeMe): MeProfile {
  const location = raw.location ?? raw.region ?? null
  return {
    ...raw,
    region: raw.region ?? location,
    location,
  }
}

/** BE가 `videoId` 대신 `id`를 주는 경우도 흡수 */
function normalizeVideoListItem(raw: VideoListItem & { id?: number }): VideoListItem | null {
  const videoId = raw.videoId ?? raw.id
  if (videoId == null || !Number.isFinite(Number(videoId))) return null
  return { ...raw, videoId: Number(videoId) }
}

export function normalizeVideoList(result: BeVideoListRaw): VideoListResult {
  if ('videos' in result && Array.isArray(result.videos)) {
    return {
      items: result.videos
        .map((item) => normalizeVideoListItem(item as VideoListItem & { id?: number }))
        .filter((item): item is VideoListItem => item != null),
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    }
  }
  const page = result as CursorPageResult<VideoListItem & { id?: number }>
  return {
    items: (page.items ?? [])
      .map((item) => normalizeVideoListItem(item))
      .filter((item): item is VideoListItem => item != null),
    nextCursor: typeof page.nextCursor === 'string' ? Number(page.nextCursor) : page.nextCursor,
    hasNext: page.hasNext,
  }
}
