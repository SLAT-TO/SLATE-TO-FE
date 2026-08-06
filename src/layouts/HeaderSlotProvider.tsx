import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { HeaderSlotActionsContext, HeaderSlotContentContext } from './headerSlotContext'

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [headerLeft, setHeaderLeft] = useState<ReactNode>(null)
  const [headerRight, setHeaderRight] = useState<ReactNode>(null)

  const clearHeaderLeft = useCallback(() => setHeaderLeft(null), [])
  const clearHeaderRight = useCallback(() => setHeaderRight(null), [])

  const actions = useMemo(
    () => ({
      setHeaderLeft,
      clearHeaderLeft,
      setHeaderRight,
      clearHeaderRight,
    }),
    [clearHeaderLeft, clearHeaderRight],
  )

  const content = useMemo(
    () => ({
      headerLeft,
      headerRight,
    }),
    [headerLeft, headerRight],
  )

  return (
    <HeaderSlotActionsContext.Provider value={actions}>
      <HeaderSlotContentContext.Provider value={content}>
        {children}
      </HeaderSlotContentContext.Provider>
    </HeaderSlotActionsContext.Provider>
  )
}
