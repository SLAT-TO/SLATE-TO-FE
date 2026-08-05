import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigateImpl } from '../utils/navigation'

/** 기존 navigate() 헬퍼를 React Router navigate에 연결 */
export default function NavigateBridge() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigateImpl((to) => {
      navigate(to)
    })
    return () => setNavigateImpl(null)
  }, [navigate])

  return null
}
