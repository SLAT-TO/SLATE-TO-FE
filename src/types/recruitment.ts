export type Recruitment = {
  id: number
  title: string
  description: string
  roles: string[]
  categories: string[]
  regions: string[]
  status: string
  viewCount: number
  bookmarkCount: number
  applicationCount: number
  authorId: number
  authorNickname: string
  createdAt: string
  updatedAt: string
}

export type CreateRecruitmentRequest = {
  title: string
  description: string
  roles: string[]
  categories: string[]
  regions: string[]
}

export type UpdateRecruitmentRequest = Partial<CreateRecruitmentRequest> & {
  status?: string
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
