import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigateImpl } from '../utils/navigation'

/** 기존 navigate() 헬퍼를 React Router navigate에 연결 */
export default function NavigateBridge() {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  useLayoutEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useLayoutEffect(() => {
    setNavigateImpl((to, options) => {
      navigateRef.current(to, options?.replace ? { replace: true } : undefined)
    })
    // Strict Mode remount 때 null로 비우면 pushState fallback이 끼어 URL만 바뀌고 UI가 안 따라감
  }, [])

  return null
}
