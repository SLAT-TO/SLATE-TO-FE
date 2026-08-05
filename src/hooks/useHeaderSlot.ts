import { useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { HeaderSlotContext } from '../layouts/headerSlotContext'

/**
 * 페이지가 전역 헤더 왼쪽(+선택적으로 오른쪽) 영역을 채운다.
 * mount 시 설정, unmount 시 비움.
 *
 * 주의: content에 인라인 JSX를 넘기면 매 렌더 새 객체가 되어 effect가 반복 실행된다.
 * 값이 렌더마다 바뀌지 않아도 되는 경우 컴포넌트 밖 상수로 분리하거나 useMemo로 감쌀 것.
 */
export function useHeaderSlot(left?: ReactNode, right: ReactNode = null) {
  const context = useContext(HeaderSlotContext)

  if (!context) {
    throw new Error('useHeaderSlot은 HeaderSlotProvider 안에서만 사용할 수 있습니다.')
  }

  const { setHeaderLeft, clearHeaderLeft, setHeaderRight, clearHeaderRight } = context

  useEffect(() => {
    if (left === undefined) return

    setHeaderLeft(left)
    setHeaderRight(right)
    return () => {
      clearHeaderLeft()
      clearHeaderRight()
    }
  }, [left, right, setHeaderLeft, clearHeaderLeft, setHeaderRight, clearHeaderRight])
}
