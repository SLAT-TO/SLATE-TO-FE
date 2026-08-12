// src/types/mypage.ts

/** 프로필 요약 정보 */
export interface ProfileSummary {
  profileImageUrl: string
  nickname: string
  /** 역할 라벨 목록 — 카드에서는 앞 2개만 태그로 노출 */
  roles: string[]
  /** 지역 라벨 목록 — 카드에서는 앞 2개만 노출 */
  regions: string[]
  email: string
  introduction: string
}

/** 프로젝트 유형 / 역할 통계 항목 (StatBar 하나에 대응) */
export interface StatItem {
  label: string
  value: number // 0 ~ max
  max: number
}

/** 프로젝트 이력 카드 데이터 */
export interface ProjectHistoryItem {
  id: string
  title: string
  thumbnailUrl: string
  tags: string[] // 예: ['단편', '촬영감독', '뮤직비디오']
  /** tags 앞쪽에 배치된 프로젝트 유형·영상 길이 태그 수 */
  metaTagCount?: number
}
