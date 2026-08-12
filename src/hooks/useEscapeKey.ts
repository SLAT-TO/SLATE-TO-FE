import { useEffect } from 'react'

// Escape 키를 누르면 onEscape 실행 (enabled가 false면 리스너를 달지 않음)
//
// 캡처 단계에서 등록 + stopPropagation — Modal 등 다른 Escape 리스너도 document에 붙기 때문에,
// 버블 단계(기본값)로 등록하면 이 훅이 열려 있는 동안(예: 모달 안에서 연 날짜 팝업) Escape 한 번에
// 두 리스너가 동시에 반응해 팝업만 닫혀야 할 때 모달까지 같이 닫히는 문제가 있었다.
// 캡처 단계는 버블 단계보다 먼저 실행되므로, 등록 순서와 무관하게 이 훅이 항상 먼저 반응하고
// stopPropagation으로 이후 버블 단계 리스너(Modal 등)에 이벤트가 전달되지 않게 막는다.
export function useEscapeKey(enabled: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onEscape()
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [enabled, onEscape])
}
