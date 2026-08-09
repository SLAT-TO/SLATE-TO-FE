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
  category?: UserCategory
  lengthType?: ProjectLengthType
  recruitPart: UserRole
  location?: UserRegion
  shootingPeriod?: string
  pay?: string
  contact?: string
  deadline?: string
}
export type UpdateRecruitmentRequest = Partial<CreateRecruitmentRequest> & {
  status?: string
}

/** BE RecruitmentBookmarkResponse */
export type RecruitmentBookmarkResult = {
  recruitmentId: number
  isBookmarked: boolean
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | string

export type Application = {
  id: number
  recruitmentId: number
  userId: number
  nickname: string
  profileImageUrl: string | null
  message: string | null
  status: ApplicationStatus
  createdAt: string
}

export type CreateApplicationRequest = {
  message?: string
}

export type UpdateApplicationRequest = {
  status: ApplicationStatus
}
