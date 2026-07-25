import { useEffect, type RefObject } from 'react'

// ref 바깥을 클릭하면 onOutsideClick 실행 (enabled가 false면 리스너를 달지 않음)
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onOutsideClick: () => void,
) {
  useEffect(() => {
    if (!enabled) return

    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [ref, enabled, onOutsideClick])
}
