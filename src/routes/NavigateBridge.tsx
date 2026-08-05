import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigateImpl } from '../utils/navigation'

/** 기존 navigate() 헬퍼를 React Router navigate에 연결 (layout effect로 첫 paint 전 연결) */
export default function NavigateBridge() {
  const navigate = useNavigate()

  useLayoutEffect(() => {
    setNavigateImpl((to, options) => {
      navigate(to, { replace: options?.replace })
    })
    return () => setNavigateImpl(null)
  }, [navigate])

  return null
}
