export type SocialType = 'GOOGLE'

export type UserRole = 'DIRECTOR' | 'EDITOR' | 'CINEMATOGRAPHER' | 'SOUND' | 'PD' | 'ART'

export type UserCategory =
  'FILM' | 'DOCUMENTARY' | 'DRAMA' | 'MUSIC_VIDEO' | 'ENTERTAINMENT' | 'COMMERCIAL'

export type UserStats = {
  projectTypes: Array<{ type: string; label: string; count: number }>
  roles: Array<{ role: string; label: string; count: number }>
}

/** GET /api/v1/users/me — 유저 정보 조회 */
export type MeProfile = {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  bio: string | null
  location: string | null
  socialType: SocialType
  primaryRole: UserRole | null
  roles: UserRole[]
  categories: UserCategory[]
  onboardingCompleted: boolean
  createdAt: string
}

/** GET /api/v1/users/me/activity-stats — 활동 통계 (Notion DB path 충돌 임시 분리) */
export type UserActivityStats = UserStats

/** mock DB 내부 저장용 */
export type MeUser = MeProfile & {
  stats: UserStats
}

export type PublicUser = {
  id: number
  nickname: string
  profileImageUrl: string | null
  bio: string | null
  location: string | null
  primaryRole: UserRole | null
  roles: UserRole[]
  categories: UserCategory[]
  stats: UserStats
}

export type OnboardingRequest = {
  agreedTermsOfService: boolean
  agreedPrivacyPolicy: boolean
  agreedMarketing?: boolean
  nickname: string
  roles: UserRole[]
  location: string
  categories: UserCategory[]
  bio?: string
  profileImageUrl?: string
}

export type OnboardingResult = {
  id: number
  onboardingCompleted: true
  updatedAt: string
}

export type UpdateProfileRequest = {
  nickname?: string
  bio?: string
  location?: string
  profileImageUrl?: string
  roles?: UserRole[]
}

export type NotificationSettings = {
  emailAllEnabled: boolean
  emailDeadlineReminder: boolean
  emailAssigned: boolean
  emailNewApplicant: boolean
  emailMissedSummary: boolean
}
