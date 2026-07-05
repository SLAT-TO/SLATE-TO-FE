import type { ReactNode } from 'react'

function HomeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12C8.619 12 7.5 13.119 7.5 14.5V19.5H12.5V14.5C12.5 13.119 11.381 12 10 12Z" />
      <path d="M14.167 14.5V19.5H17.5C18.881 19.5 20 18.381 20 17V9.4C20.0002 8.967 19.832 8.551 19.531 8.24L12.449 0.584C11.2-.268 9.091-.35 7.739.899 7.675.959 7.613 1.02 7.553 1.084L.484 8.737C.174 9.05 0 9.472 0 9.912V17C0 18.381 1.119 19.5 2.5 19.5H5.833V14.5C5.849 12.228 7.684 10.373 9.899 10.319 12.188 10.264 14.149 12.151 14.167 14.5Z" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <line x1="2" y1="8" x2="18" y2="8" />
      <line x1="6" y1="2" x2="6" y2="5" strokeLinecap="round" />
      <line x1="14" y1="2" x2="14" y2="5" strokeLinecap="round" />
    </svg>
  )
}

function WorkspaceIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" />
      <rect x="11.5" y="1" width="7.5" height="7.5" rx="1.5" />
      <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  )
}

function ProjectIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 2C1.895 2 1 2.895 1 4V16C1 17.105 1.895 18 3 18H17C18.105 18 19 17.105 19 16V7L13 2H3Z" />
      <path d="M13 2V7H19" fill="none" stroke="white" strokeWidth="1.5" />
      <line x1="5" y1="11" x2="15" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="14" x2="12" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MatchingIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="6.5" cy="6" r="3.5" />
      <path d="M0 18C0 14.686 2.91 12 6.5 12C10.09 12 13 14.686 13 18H0Z" />
      <circle cx="15" cy="6" r="2.5" />
      <path d="M12 18C12.001 16.374 12.926 14.882 14.4 14.04C14.921 13.757 15.457 13.6 16 13.6H20V17.5C20 17.776 19.776 18 19.5 18H12Z" />
    </svg>
  )
}

type NavItem = {
  label: string
  href: string
  icon: ReactNode
  active?: boolean
  sub?: boolean
}

const navItems: NavItem[] = [
  { label: '홈', href: '/', icon: <HomeIcon />, active: true },
  { label: '캘린더', href: '/calendar', icon: <CalendarIcon /> },
  { label: '워크스페이스', href: '/workspace', icon: <WorkspaceIcon /> },
  { label: '프로젝트 명', href: '/project', icon: <ProjectIcon />, sub: true },
  { label: '매칭', href: '/matching', icon: <MatchingIcon /> },
]

export default function Sidebar() {
  return (
    <aside className="border-border bg-bg-primary flex h-screen w-[260px] flex-shrink-0 flex-col border-r">
      {/* 로고 */}
      <div className="flex items-center gap-3 px-5 pt-[51px]">
        <div className="bg-primary flex h-[27px] w-[27px] items-center justify-center rounded-md">
          <span className="text-[11px] font-bold text-white">S</span>
        </div>
        <span className="text-body-sm text-neutral-11 font-bold">SLAT-TO</span>
      </div>

      {/* 네비게이션 */}
      <nav className="mt-[38px] flex flex-col gap-[5px] px-5">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={[
              'text-caption-lg flex h-8 items-center gap-[13px] rounded-lg',
              item.sub ? 'ml-[13px]' : '',
              item.active
                ? 'bg-main-1 text-primary w-[144px] px-[7px] font-medium'
                : 'text-neutral-6 hover:bg-neutral-2 hover:text-neutral-9 w-[144px] px-[7px]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center">
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* 하단 고정 영역 */}
      <div className="border-border mt-auto flex flex-col gap-[5px] border-t px-5 py-4">
        <a
          href="/mypage"
          className="text-caption-lg text-neutral-6 hover:bg-neutral-2 hover:text-neutral-9 flex h-8 w-[144px] items-center gap-[13px] rounded-lg px-[7px]"
        >
          <span className="flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="7" r="4" />
              <path d="M2 19C2 15.134 5.582 12 10 12C14.418 12 18 15.134 18 19H2Z" />
            </svg>
          </span>
          마이페이지
        </a>
        <a
          href="/settings"
          className="text-caption-lg text-neutral-6 hover:bg-neutral-2 hover:text-neutral-9 flex h-8 w-[144px] items-center gap-[13px] rounded-lg px-[7px]"
        >
          <span className="flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="2.5" />
              <path d="M17.14 10.94a7.17 7.17 0 0 0 .06-.94 7.17 7.17 0 0 0-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.62l-1.92-3.32a.49.49 0 0 0-.59-.21l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 12 .5H8a.48.48 0 0 0-.47.41l-.36 2.54a7.03 7.03 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.21L.65 6.96a.47.47 0 0 0 .12.62l2.03 1.58a7.27 7.27 0 0 0 0 1.88L.77 12.62a.47.47 0 0 0-.12.62l1.92 3.32c.12.21.37.29.59.21l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.06.24.27.41.47.41h4c.24 0 .44-.17.47-.41l.36-2.54a7.03 7.03 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.21l1.92-3.32a.47.47 0 0 0-.12-.62l-2.03-1.58Z" />
            </svg>
          </span>
          설정
        </a>
      </div>
    </aside>
  )
}
