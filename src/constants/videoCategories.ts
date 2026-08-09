import type { UserCategory } from '../types/user'
import type { ProjectLengthType } from '../types/project'

/** BE Category enum 기준 */
export const VIDEO_CATEGORY_OPTIONS: ReadonlyArray<{ value: UserCategory; label: string }> = [
  { value: 'YOUTUBE_CONTENT', label: '유튜브 콘텐츠' },
  { value: 'AD_BRAND', label: '광고 / 브랜드 영상' },
  { value: 'MUSIC_VIDEO', label: '뮤직비디오' },
  { value: 'WEDDING_EVENT', label: '웨딩 / 이벤트 영상' },
  { value: 'DOCUMENTARY', label: '다큐멘터리' },
  { value: 'FILM_DRAMA', label: '영화 / 드라마' },
  { value: 'CORPORATE_PROMO', label: '기업 홍보영상' },
  { value: 'ETC', label: '기타' },
]

export const VIDEO_CATEGORY_LABELS = VIDEO_CATEGORY_OPTIONS.map((o) => o.label)

export type VideoCategory = (typeof VIDEO_CATEGORY_LABELS)[number]

export function videoCategoryLabel(value: string): string {
  return VIDEO_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value
}

/** 영화 / 드라마 선택 시 장편·단편 구분 — BE LengthType enum 기준 */
export const FILM_LENGTH_OPTIONS: ReadonlyArray<{ value: ProjectLengthType; label: string }> = [
  { value: 'LONG_FORM', label: '장편' },
  { value: 'SHORT_FORM', label: '단편' },
]

export const FILM_LENGTH_LABELS = FILM_LENGTH_OPTIONS.map((o) => o.label)

export type FilmLength = (typeof FILM_LENGTH_LABELS)[number]

export function filmLengthLabel(value: string): string {
  return FILM_LENGTH_OPTIONS.find((o) => o.value === value)?.label ?? value
}
