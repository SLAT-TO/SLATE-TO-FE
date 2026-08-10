import type { UserRole, UserCategory, UserRegion } from './user'
import type { ProjectLengthType, CursorPage } from './project'

export type RecruitmentStatus = 'RECRUITING' | 'CLOSED' | string

export type RecruitmentWriter = {
  id: number
  nickname: string
  profileImageUrl: string | null
  primaryRole: UserRole | null
  locations: UserRegion[]
}

export type Recruitment = {
  id: number
  title: string
  category: UserCategory
  lengthType: ProjectLengthType | null
  recruitPart: UserRole
  location: UserRegion
  pay: string
  deadline: string
  dday: number
  status: RecruitmentStatus
  viewCount: number
  isBookmarked: boolean
  isMine: boolean
  writer: RecruitmentWriter
  createdAt: string
}

export type RecruitmentListResponse = CursorPage<Recruitment>

export type CreateRecruitmentRequest = {
  title: string
  description: string
  category: UserCategory
  lengthType?: ProjectLengthType
  recruitPart: UserRole
  location: UserRegion
  pay?: string
  deadline: string
}

export type UpdateRecruitmentRequest = Partial<CreateRecruitmentRequest> & {
  status?: string
}

/** BE RecruitmentBookmarkResponse */
export type RecruitmentBookmarkResult = {
  recruitmentId: number
  isBookmarked: boolean
}

export type Application = {
  id: number
  recruitmentId: number
  userId: number
  nickname: string
  profileImageUrl: string | null
  message: string | null
  status: ApplicationStatusValue
  createdAt: string
}

export type CreateApplicationRequest = {
  message: string
  referenceLink?: string
}

export type UpdateApplicationRequest = {
  status: ApplicationStatusValue
}

export type ApplicationStatusValue = 'PENDING' | 'ACCEPTED' | 'REJECTED'

/** GET /recruitments/{id} — 목록 필드 + 상세 전용 필드 */
export type RecruitmentDetailResponse = Recruitment & {
  description: string
  shootingPeriod: string
  contact: string
  applicantCount: number
  hasApplied: boolean
  myApplicationStatus: ApplicationStatusValue | null
  updatedAt: string
}

/** GET /users/me/applications — 공고 정보 + 내 지원 정보 */
export type AppliedRecruitment = Recruitment & {
  applicationId: number
  applicationStatus: ApplicationStatusValue
  appliedAt: string
}

/** POST /recruitments/{id}/applications 응답 */
export type ApplicationResult = {
  applicationId: number
  recruitmentId: number
  applicationStatus: ApplicationStatusValue
  message: string
  referenceLink: string | null
  appliedAt: string
}

export interface ApplicantSummary {
  id: number
  nickname: string
  profileImageUrl: string | null
  /** 프로필 자기소개 (공고별 코멘트인 message와 다름) */
  bio: string | null
  primaryRole: UserRole | null
  locations: UserRegion[]
}

export interface RecruitmentApplication {
  applicationId: number
  applicationStatus: ApplicationStatusValue
  /** 지원 시 작성한 코멘트 — 목록 화면에는 표시하지 않음 */
  message: string
  referenceLink: string | null
  /** ISO 8601 */
  appliedAt: string
  applicant: ApplicantSummary
}
