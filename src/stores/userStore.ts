import { create } from 'zustand'
import { getAccessToken } from '../api/client'
import { getMe } from '../api/users'
import type { MeProfile } from '../types/user'

/** idle: 아직 요청 안 함(비로그인 포함) / error: 요청 실패 — null 하나로는 둘을 구분할 수 없어 분리 */
type UserStatus = 'idle' | 'loading' | 'success' | 'error'

interface UserState {
  user: MeProfile | null
  status: UserStatus

  /** 토큰이 있을 때만 프로필을 불러온다. 중복 호출은 무시 */
  fetchUser: () => Promise<void>
  setUser: (user: MeProfile) => void
  /** 프로필 수정처럼 응답이 MeProfile 일부 필드만 담고 있을 때 기존 값 위에 병합 */
  patchUser: (patch: Partial<MeProfile>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  status: 'idle',

  fetchUser: async () => {
    if (!getAccessToken()) return
    const { status } = get()
    // 이미 조회했거나 조회 중이면 재요청하지 않는다
    if (status === 'loading' || status === 'success') return

    set({ status: 'loading' })
    try {
      const user = await getMe()
      set({ user, status: 'success' })
    } catch {
      set({ user: null, status: 'error' })
    }
  },

  setUser: (user) => set({ user, status: 'success' }),
  patchUser: (patch) =>
    set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  clearUser: () => set({ user: null, status: 'idle' }),
}))
