import { useLocation } from 'react-router-dom'

/** BrowserRouter 하위에서는 React Router location을 사용한다 */
export function usePathname(): string {
  return useLocation().pathname
}
