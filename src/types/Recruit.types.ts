export type FilterCategory = 'region' | 'videoType' | 'role'

export type SelectedFilters = Record<FilterCategory, string[]>

export interface SelectedFilterChip {
  category: FilterCategory
  value: string
}

export interface FilterGroup {
  label: string
  options: string[]
  single?: boolean
  span?: 'wide' | 'narrow'
  columns?: number
  showWhen?: (selectedInCategory: string[]) => boolean
}

export interface FilterConfig {
  key: FilterCategory
  buttonLabel: string
  groups: FilterGroup[]
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
  comment: string
  referenceLink?: string
  fileName?: string
  fileUrl?: string
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

export interface ApplicationInfo {
  comment: string
  referenceLink?: string
  fileName?: string
  fileUrl?: string
}
