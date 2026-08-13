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

/** BE는 type/role 코드만 내려줌 — label은 화면에서 변환 */
export type UserStats = {
  projectTypes: Array<{ type: string; label?: string; count: number }>
  roles: Array<{ role: string; label?: string; count: number }>
}

/** GET /api/v1/users/me — BE는 region, FE 호환용 location 병행 */
export type MeProfile = {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  bio: string | null
  /** BE GET /users/me 응답 — 활동 지역 전체 */
  regions: (UserRegion | string)[]
  /** 대표 지역 (regions의 첫 값) — 기존 화면 호환용 */
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
  locations: UserRegion[]
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
  profileImageUrl?: string
  bio?: string
  /** BE는 locations 배열 — 전달하면 기존 지역을 모두 지우고 교체 */
  locations?: (UserRegion | string)[]
  roles?: UserRole[]
  categories?: UserCategory[]
}

/** PATCH /api/v1/users/me 응답 — GET /users/me(MeProfile)와 달리 email·socialType·
 * onboardingCompleted·createdAt이 없다. MeProfile로 잘못 취급해 스토어를 통째로 덮으면
 * 그 필드들이 유실된다 (예: 회원탈퇴 시 socialType 기준 비밀번호 확인이 스킵됨) */
export type ProfileUpdateResult = {
  id: number
  nickname: string
  profileImageUrl: string | null
  bio: string | null
  locations: (UserRegion | string)[]
  primaryRole: UserRole | null
  roles: UserRole[]
  categories: UserCategory[]
  updatedAt: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type PasswordChangeResult = {
  userId: number
  accessToken: string
  onboardingCompleted: boolean
}

export type DeleteAccountRequest = {
  agreed: boolean
  password?: string
}
