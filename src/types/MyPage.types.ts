// src/types/mypage.ts

/** 프로필 요약 정보 */
export interface ProfileSummary {
  profileImageUrl: string
  nickname: string
  role: string // 예: '연출자'
  region: string // 예: '서울'
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
}
