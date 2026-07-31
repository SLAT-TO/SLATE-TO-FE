export type FilterCategory = 'region' | 'videoType' | 'role'

export type SelectedFilters = Record<FilterCategory, string[]>

export interface SelectedFilterChip {
  category: FilterCategory
  value: string
}

export interface FilterGroup {
  label: string
  options: string[]
  /** 패널 안에서 이 그룹이 차지할 비중 */
  span?: 'wide' | 'narrow'
  /** wide 그룹의 열 수 (없으면 5). narrow 그룹은 무시됨 */
  columns?: number
  /** 없으면 항상 노출 */
  showWhen?: (selectedInCategory: string[]) => boolean
}

export interface FilterConfig {
  key: FilterCategory
  buttonLabel: string
  groups: FilterGroup[]
}

export interface JobPost {
  id: number
  type: string
  category: string
  title: string
  description: string
  role: string
  price?: string
  dDay: string
}

export interface RecruitmentDetail {
  id: number
  /** TODO: API 연동 시 제거 — author.userId === 내 userId로 판단 */
  isOwner: boolean
  title: string
  /** 외주/단편영화 등 상단 태그 */
  type: string
  category: string
  status: '모집 중' | '모집 완료'
  dDay: string
  createdAt: string
  viewCount: number
  /** 공고 정보 */
  recruitPart: string
  shootingRegion: string
  videoType: string
  videoLength: string
  pay: string
  participationPeriod: string
  deadline: string
  contact: string
  description: string
  author: RecruitmentAuthor
}

export interface RecruitmentAuthor {
  userId: number
  name: string
  role: string
  region: string
  email: string
  profileImageUrl: string
}

export interface RecruitApplicant {
  id: number
  recruitmentId: number
  applicantId: number
  applicantName: string
  applicantProfileImageUrl: string
  appliedAt: string
  introduction: string
}

export interface JobPostFormValues {
  deadline?: Date
  recruitPart: string
  shootingRegion: string
  videoType: string
  videoLength: string
  participationPeriod?: { from?: Date; to?: Date }
  pay: string
  description: string
}
