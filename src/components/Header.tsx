import { useContext } from 'react'
import { HeaderSlotContext } from '../layouts/headerSlotContext'
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
  const headerLeft = useContext(HeaderSlotContext)?.headerLeft ?? null

  return (
    <header className="bg-bg-secondary flex h-16 flex-shrink-0 items-center justify-between px-8">
      <div className="flex items-center gap-3">{headerLeft}</div>

      {/* 우측 액션 영역 */}
      <div className="flex items-center gap-4">
        {/* 알림 */}
        <button
          type="button"
          className="text-neutral-6 hover:bg-neutral-2 hover:text-neutral-9 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          aria-label="알림"
        >
          <BellIcon />
        </button>

        {/* 아바타 */}
        <button
          type="button"
          className="bg-neutral-3 text-caption-sm text-neutral-7 hover:bg-neutral-4 flex h-10 w-10 items-center justify-center rounded-full font-medium"
          aria-label="프로필"
        >
          {userName.charAt(0)}
        </button>
      </div>
    </header>
  )
}
