import { createContext } from 'react'
import type { ReactNode } from 'react'

export interface HeaderSlotContextValue {
  headerLeft: ReactNode
  setHeaderLeft: (content: ReactNode) => void
  clearHeaderLeft: () => void
}

export const HeaderSlotContext = createContext<HeaderSlotContextValue | null>(null)
