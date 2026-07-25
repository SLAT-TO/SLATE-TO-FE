/** 프로젝트 생성·프로필 — 영상 카테고리 */
export const VIDEO_CATEGORY_LABELS = [
  '유튜브 콘텐츠',
  '광고 / 브랜드 영상',
  '뮤직비디오',
  '웨딩 / 이벤트 영상',
  '다큐멘터리',
  '영화 / 드라마',
  '기업 홍보영상',
  '기타',
] as const

export type VideoCategory = (typeof VIDEO_CATEGORY_LABELS)[number]

export const VIDEO_CATEGORY_OPTIONS: ReadonlyArray<{
  value: VideoCategory
  label: string
}> = VIDEO_CATEGORY_LABELS.map((label) => ({ value: label, label }))

/** 영화 / 드라마 선택 시 장편·단편 구분 */
export const FILM_LENGTH_LABELS = ['장편', '단편'] as const

export type FilmLength = (typeof FILM_LENGTH_LABELS)[number]

export const FILM_LENGTH_OPTIONS: ReadonlyArray<{ value: FilmLength; label: string }> =
  FILM_LENGTH_LABELS.map((label) => ({ value: label, label }))
