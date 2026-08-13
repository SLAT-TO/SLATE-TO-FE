import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { HeaderSlotActionsContext, HeaderSlotContentContext } from './headerSlotContext'

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [headerLeft, setHeaderLeft] = useState<ReactNode>(null)
  const [headerRight, setHeaderRight] = useState<ReactNode>(null)
  const [hideDefaultActions, setHideDefaultActions] = useState(false)

  const clearHeaderLeft = useCallback(() => setHeaderLeft(null), [])
  const clearHeaderRight = useCallback(() => setHeaderRight(null), [])
  const clearHideDefaultActions = useCallback(() => setHideDefaultActions(false), [])

  const actions = useMemo(
    () => ({
      setHeaderLeft,
      clearHeaderLeft,
      setHeaderRight,
      clearHeaderRight,
      setHideDefaultActions,
      clearHideDefaultActions,
    }),
    [clearHeaderLeft, clearHeaderRight, clearHideDefaultActions],
  )

  const content = useMemo(
    () => ({
      headerLeft,
      headerRight,
      hideDefaultActions,
    }),
    [headerLeft, headerRight, hideDefaultActions],
  )

  return (
    <HeaderSlotActionsContext.Provider value={actions}>
      <HeaderSlotContentContext.Provider value={content}>
        {children}
      </HeaderSlotContentContext.Provider>
    </HeaderSlotActionsContext.Provider>
  )
}
