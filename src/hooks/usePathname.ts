import { useEffect, useState } from 'react'
import { getPathname } from '../utils/navigation'

export function usePathname(): string {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const onPopState = () => setPathname(getPathname())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return pathname
}
