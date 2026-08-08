import type { UserRegion } from '../types/user'

/** 온보딩·프로필 — 주요 활동 지역. BE UserRegion 기준 */
export const ONBOARDING_REGION_OPTIONS: ReadonlyArray<{ value: UserRegion; label: string }> = [
  { value: 'SEOUL', label: '서울시' },
  { value: 'GYEONGGI', label: '경기도' },
  { value: 'GANGWON', label: '강원도' },
  { value: 'CHUNGCHEONGNAM', label: '충청남도' },
  { value: 'CHUNGCHEONGBUK', label: '충청북도' },
  { value: 'JEOLLABUK', label: '전라북도' },
  { value: 'JEOLLANAM', label: '전라남도' },
  { value: 'GYEONGSANGBUK', label: '경상북도' },
  { value: 'GYEONGSANGNAM', label: '경상남도' },
  { value: 'JEJU', label: '제주도' },
  { value: 'NATIONWIDE', label: '전국' },
]

export type Region = UserRegion
