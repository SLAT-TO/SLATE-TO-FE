import { createContext } from 'react'
import type { ReactNode } from 'react'

export interface HeaderSlotContextValue {
  headerLeft: ReactNode
  setHeaderLeft: (content: ReactNode) => void
  clearHeaderLeft: () => void
  /** 전역 헤더 아바타 오른쪽에 붙는 페이지별 추가 영역 (예: 프로젝트 상세의 ActionMenu) */
  headerRight: ReactNode
  setHeaderRight: (content: ReactNode) => void
  clearHeaderRight: () => void
}

export const HeaderSlotContext = createContext<HeaderSlotContextValue | null>(null)
