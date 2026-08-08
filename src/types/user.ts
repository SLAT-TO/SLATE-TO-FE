export type SocialType = 'EMAIL' | 'GOOGLE' | 'KAKAO'

export type UserRole =
  | 'DIRECTOR'
  | 'PD'
  | 'CINEMATOGRAPHER'
  | 'EDITOR'
  | 'ART'
  | 'SOUND'
  | 'WRITER'
  | 'LIGHTING'
  | 'ACTOR'
  | 'ETC'

export type UserCategory =
  | 'YOUTUBE_CONTENT'
  | 'AD_BRAND'
  | 'MUSIC_VIDEO'
  | 'WEDDING_EVENT'
  | 'DOCUMENTARY'
  | 'FILM_DRAMA'
  | 'CORPORATE_PROMO'
  | 'ETC'

export type UserRegion =
  | 'SEOUL'
  | 'GYEONGGI'
  | 'GANGWON'
  | 'CHUNGCHEONGNAM'
  | 'CHUNGCHEONGBUK'
  | 'JEOLLABUK'
  | 'JEOLLANAM'
  | 'GYEONGSANGBUK'
  | 'GYEONGSANGNAM'
  | 'JEJU'
  | 'NATIONWIDE'

export type UserStats = {
  projectTypes: Array<{ type: string; label: string; count: number }>
  roles: Array<{ role: string; label: string; count: number }>
}

/** GET /api/v1/users/me — BE는 region, FE 호환용 location 병행 */
export type MeProfile = {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  bio: string | null
  region: UserRegion | string | null
  location: UserRegion | string | null
  socialType: SocialType
  primaryRole: UserRole | null
  roles: UserRole[]
  categories: UserCategory[]
  onboardingCompleted: boolean
  createdAt: string
}

/** GET /api/v1/users/me/activity-stats — BE 미구현, mock 전용 */
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
  location: UserRegion | string | null
  primaryRole: UserRole | null
  roles: UserRole[]
  categories: UserCategory[]
  stats: UserStats
}

/** BE UserOnboardingRequest 기준 */
export type OnboardingRequest = {
  agreedTerms: boolean
  nickname: string
  roles: UserRole[]
  regions: (UserRegion | string)[]
  categories: UserCategory[]
  bio?: string
  profileImageUrl?: string
}

export type OnboardingResult = {
  id: number
  onboardingCompleted: boolean
  updatedAt: string
}

export type UpdateProfileRequest = {
  nickname?: string
  bio?: string
  location?: UserRegion | string
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

/** FE mock 전용 — BE 비밀번호 변경 API 미구현 */
export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

/** FE mock 전용 — 회원탈퇴 시 비밀번호 재확인 (BE 미구현) */
export type DeleteAccountRequest = {
  agreed: boolean
  password: string
}
