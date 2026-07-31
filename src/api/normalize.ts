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

export function normalizeFeedback(raw: Feedback): Feedback {
  return { ...raw, status: toFeedbackStatus(raw.status) }
}

export function normalizeFeedbackReply(raw: FeedbackReply): FeedbackReply {
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

export function normalizeVideoList(result: BeVideoListRaw): VideoListResult {
  if ('videos' in result && Array.isArray(result.videos)) {
    return {
      items: result.videos,
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    }
  }
  const page = result as CursorPageResult<VideoListItem>
  return {
    items: page.items,
    nextCursor: typeof page.nextCursor === 'string' ? Number(page.nextCursor) : page.nextCursor,
    hasNext: page.hasNext,
  }
}
