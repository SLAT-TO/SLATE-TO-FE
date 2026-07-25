import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { HeaderSlotContext } from './headerSlotContext'

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [headerLeft, setHeaderLeft] = useState<ReactNode>(null)

  const clearHeaderLeft = useCallback(() => setHeaderLeft(null), [])

  const value = useMemo(
    () => ({ headerLeft, setHeaderLeft, clearHeaderLeft }),
    [headerLeft, clearHeaderLeft],
  )

  return <HeaderSlotContext.Provider value={value}>{children}</HeaderSlotContext.Provider>
}
