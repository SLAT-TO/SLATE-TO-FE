import { createContext } from 'react'
import type { ReactNode } from 'react'

/** Header가 구독하는 슬롯 콘텐츠 (변경 시 Header만 리렌더) */
export interface HeaderSlotContentValue {
  headerLeft: ReactNode
  headerRight: ReactNode
}

/** 페이지가 구독하는 setter (콘텐츠 변경과 분리해 무한 루프 방지) */
export interface HeaderSlotActionsValue {
  setHeaderLeft: (content: ReactNode) => void
  clearHeaderLeft: () => void
  setHeaderRight: (content: ReactNode) => void
  clearHeaderRight: () => void
}

export const HeaderSlotContentContext = createContext<HeaderSlotContentValue | null>(null)
export const HeaderSlotActionsContext = createContext<HeaderSlotActionsValue | null>(null)

/** @deprecated HeaderSlotContentContext / HeaderSlotActionsContext 사용 */
export type HeaderSlotContextValue = HeaderSlotContentValue & HeaderSlotActionsValue
