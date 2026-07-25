import { create } from 'zustand'
import type { OnboardingRole } from '../constants/onboardingRoles'
import type { OnboardingVideoCategory } from '../constants/onboardingVideoCategories'
import type { Region } from '../constants/regions'

// 온보딩 4단계에 걸쳐 모은 값을 페이지 레벨에서 소유한다. (공용 컴포넌트가 아님)
interface OnboardingProfile {
  name: string
  email: string
  intro: string
  /** 미리보기용 object URL. 최종 제출 시엔 file을 업로드한다. */
  avatarUrl: string
  avatarFile: File | null
}

interface OnboardingState {
  roles: OnboardingRole[]
  regions: Region[]
  categories: OnboardingVideoCategory[]
  profile: OnboardingProfile

  toggleRole: (role: OnboardingRole) => void
  toggleRegion: (region: Region) => void
  toggleCategory: (category: OnboardingVideoCategory) => void
  setProfileField: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void
  reset: () => void
}

// 배열에서 값이 있으면 빼고 없으면 더하는 다중선택 토글 헬퍼
const toggle = <T>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

const initialProfile: OnboardingProfile = {
  name: '',
  email: '',
  intro: '',
  avatarUrl: '',
  avatarFile: null,
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  roles: [],
  regions: [],
  categories: [],
  profile: initialProfile,

  toggleRole: (role) => set((s) => ({ roles: toggle(s.roles, role) })),
  toggleRegion: (region) => set((s) => ({ regions: toggle(s.regions, region) })),
  toggleCategory: (category) => set((s) => ({ categories: toggle(s.categories, category) })),
  setProfileField: (key, value) => set((s) => ({ profile: { ...s.profile, [key]: value } })),
  reset: () => set({ roles: [], regions: [], categories: [], profile: initialProfile }),
}))
