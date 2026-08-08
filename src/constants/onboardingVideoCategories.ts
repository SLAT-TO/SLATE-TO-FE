import type { UserCategory } from '../types/user'

/** 온보딩 3단계 — 활동 영상 카테고리. BE UserCategory 기준 */
export const ONBOARDING_VIDEO_CATEGORY_OPTIONS: ReadonlyArray<{
  value: UserCategory
  label: string
}> = [
  { value: 'YOUTUBE_CONTENT', label: '유튜브 콘텐츠' },
  { value: 'WEDDING_EVENT', label: '웨딩 / 이벤트 영상' },
  { value: 'CORPORATE_PROMO', label: '기업 홍보영상' },
  { value: 'AD_BRAND', label: '광고 / 브랜드 영상' },
  { value: 'DOCUMENTARY', label: '다큐멘터리' },
  { value: 'ETC', label: '기타' },
  { value: 'MUSIC_VIDEO', label: '뮤직비디오' },
  { value: 'FILM_DRAMA', label: '영화 / 드라마' },
]

export type OnboardingVideoCategory = UserCategory
