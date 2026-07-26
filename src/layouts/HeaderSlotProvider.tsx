import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { HeaderSlotContext } from './headerSlotContext'

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [headerLeft, setHeaderLeft] = useState<ReactNode>(null)
  const [headerRight, setHeaderRight] = useState<ReactNode>(null)

  const clearHeaderLeft = useCallback(() => setHeaderLeft(null), [])
  const clearHeaderRight = useCallback(() => setHeaderRight(null), [])

  const value = useMemo(
    () => ({
      headerLeft,
      setHeaderLeft,
      clearHeaderLeft,
      headerRight,
      setHeaderRight,
      clearHeaderRight,
    }),
    [headerLeft, clearHeaderLeft, headerRight, clearHeaderRight],
  )

  return <HeaderSlotContext.Provider value={value}>{children}</HeaderSlotContext.Provider>
}
