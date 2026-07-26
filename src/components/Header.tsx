import { navigate } from '../utils/navigation'

import { useContext } from 'react'
import { HeaderSlotContext } from '../layouts/headerSlotContext'
import HeaderProfileMenu from './HeaderProfileMenu'
type HeaderProps = {
  userName?: string
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 -0.05 20 20.05" fill="currentColor">
      <path d="M6.187 17.5a4 4 0 0 0 7.626 0H6.187Z" />
      <path d="M18.66 10.458L17.213 5.688a9.51 9.51 0 0 0-5.18-6.156A9.534 9.534 0 0 0 2.15 6.067L1.027 10.68a5 5 0 0 0 4.048 6.153h9.9a5 5 0 0 0 4.684-6.375Z" />
    </svg>
  )
}

export default function Header({ userName = '000' }: HeaderProps) {
  const slot = useContext(HeaderSlotContext)
  const headerLeft = slot?.headerLeft ?? null
  const headerRight = slot?.headerRight ?? null

  return (
    <header className="bg-bg-secondary flex h-16 shrink-0 items-center justify-between px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">{headerLeft}</div>

      {/* 우측 액션 영역 */}
      <div className="flex shrink-0 items-center gap-4">
        {/* 알림 */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="text-neutral-6 hover:bg-neutral-2 hover:text-neutral-9 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          aria-label="알림"
        >
          <BellIcon />
        </button>

        {/* 아바타 (클릭 시 나의 구인구직/마이페이지/설정 드롭다운) */}
        <HeaderProfileMenu userName={userName} />

        {/* 페이지별 추가 영역 (예: ProjectDetailPage의 ActionMenu) */}
        {headerRight}
      </div>
    </header>
  )
}
