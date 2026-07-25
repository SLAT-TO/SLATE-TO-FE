import { useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { HeaderSlotContext } from '../layouts/headerSlotContext'

/**
 * 페이지가 전역 헤더 왼쪽 영역을 채운다.
 * mount 시 설정, unmount 시 비움.
 */
export function useHeaderSlot(content: ReactNode) {
  const context = useContext(HeaderSlotContext)

  if (!context) {
    throw new Error('useHeaderSlot은 HeaderSlotProvider 안에서만 사용할 수 있습니다.')
  }

  const { setHeaderLeft, clearHeaderLeft } = context

  useEffect(() => {
    setHeaderLeft(content)
    return clearHeaderLeft
  }, [content, setHeaderLeft, clearHeaderLeft])
}
