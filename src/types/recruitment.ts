/** BE 미구현 — Recruitment 컨트롤러 자체가 없음 (엔티티만 존재, Swagger에 미노출).
 * BE 엔티티 필드(recruitPart/shootingPeriod/pay/contact/location/deadline, 전부 단일 값)가
 * 아래 모델(roles/categories/regions 배열 + 카운트)과 구조가 많이 다름 — 컨트롤러 확정 전까지는
 * 이 타입을 엔티티에 맞춰 미리 바꾸지 않는다 (섣불리 맞췄다가 다시 어긋날 위험). */
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
