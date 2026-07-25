import type { MeProfile } from '../types/user'
import type { VideoListItem, VideoListResult } from '../types/video'

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
