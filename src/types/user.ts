export type AuthProvider = 'GOOGLE'

export type UserRole = 'DIRECTOR' | 'EDITOR' | 'CINEMATOGRAPHER' | 'SOUND' | 'PD' | 'ART'

export type UserRegion =
  | 'SEOUL'
  | 'GYEONGGI'
  | 'GANGWON'
  | 'CHUNGNAM'
  | 'CHUNGBUK'
  | 'JEONBUK'
  | 'JEONNAM'
  | 'GYEONGBUK'
  | 'GYEONGNAM'
  | 'JEJU'
  | 'NATIONWIDE'

export type UserCategory =
  'FILM' | 'DOCUMENTARY' | 'DRAMA' | 'MUSIC_VIDEO' | 'ENTERTAINMENT' | 'COMMERCIAL'

export type StatCountItem = {
  type?: string
  role?: string
  label: string
  count: number
}

export type UserStats = {
  projectTypes: Array<{ type: string; label: string; count: number }>
  roles: Array<{ role: string; label: string; count: number }>
}

/** GET /api/v1/users/me — 통일 응답 */
export type MeUser = {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  provider: AuthProvider
  onboardingCompleted: boolean
  primaryRole: UserRole | null
  roles: UserRole[]
  location: UserRegion | null
  regions: UserRegion[]
  categories: UserCategory[]
  bio: string | null
  createdAt: string
  stats: UserStats
}

export type PublicUser = {
  id: number
  nickname: string
  profileImageUrl: string | null
  bio: string | null
  location: UserRegion | null
  primaryRole: UserRole | null
  roles: UserRole[]
  categories: UserCategory[]
  stats: UserStats
}

export type OnboardingRequest = {
  agreedTermsOfService: boolean
  roles: UserRole[]
  regions: UserRegion[]
  categories: UserCategory[]
  nickname: string
  bio?: string
  profileImageUrl?: string
}

export type OnboardingResult = {
  id: number
  nickname: string
  bio: string | null
  profileImageUrl: string | null
  roles: UserRole[]
  regions: UserRegion[]
  categories: UserCategory[]
  onboardingCompleted: true
}

export type UpdateProfileRequest = {
  nickname?: string
  bio?: string
  location?: UserRegion
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
