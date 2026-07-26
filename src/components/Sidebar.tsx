import type { ReactNode } from 'react'
import { usePathname } from '../hooks/usePathname'
import { navigate } from '../utils/navigation'
import logo from '../assets/icons/logo.svg?raw'

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
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.41667 0C4.64312 0 3.90125 0.307291 3.35427 0.854272C2.80729 1.40125 2.5 2.14312 2.5 2.91667V17.0833C2.5 17.8569 2.80729 18.5987 3.35427 19.1457C3.90125 19.6927 4.64312 20 5.41667 20C6.19021 20 6.93208 19.6927 7.47906 19.1457C8.02604 18.5987 8.33333 17.8569 8.33333 17.0833V2.91667C8.33333 2.14312 8.02604 1.40125 7.47906 0.854272C6.93208 0.307291 6.19021 0 5.41667 0Z" />
      <path d="M14.5837 0C13.8101 0 13.0682 0.307291 12.5213 0.854272C11.9743 1.40125 11.667 2.14312 11.667 2.91667V17.0833C11.667 17.8569 11.9743 18.5987 12.5213 19.1457C13.0682 19.6927 13.8101 20 14.5837 20C15.3572 20 16.0991 19.6927 16.6461 19.1457C17.193 18.5987 17.5003 17.8569 17.5003 17.0833V2.91667C17.5003 2.14312 17.193 1.40125 16.6461 0.854272C16.0991 0.307291 15.3572 0 14.5837 0Z" />
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
  match?: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  { label: '홈', href: '/', icon: <HomeIcon />, match: (path) => path === '/' },
  {
    label: '캘린더',
    href: '/calendar',
    icon: <CalendarIcon />,
    match: (path) => path.startsWith('/calendar'),
  },
  {
    label: '워크스페이스',
    href: '/workspace',
    icon: <WorkspaceIcon />,
    match: (path) => path === '/workspace' || path.startsWith('/workspace/'),
  },
  {
    label: '매칭',
    href: '/matching',
    icon: <MatchingIcon />,
    match: (path) => path.startsWith('/matching'),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-border bg-bg-primary flex h-screen w-[210px] flex-shrink-0 flex-col border-r">
      <div className="flex items-center pt-[46px] pl-[34px]">
        <span
          role="img"
          aria-label="SLATE-TO"
          className="[&_svg]:h-[20px] [&_svg]:w-[143px]"
          dangerouslySetInnerHTML={{ __html: logo }}
        />
      </div>

      <nav className="mt-[69px] flex flex-col gap-8 pl-[34px]">
        {navItems.map((item) => {
          const active = item.match?.(pathname) ?? pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => {
                event.preventDefault()
                navigate(item.href)
              }}
              className={[
                'text-body-sm flex h-8 items-center gap-[13px] rounded-lg font-semibold',
                active
                  ? 'bg-main-1 text-primary w-[144px] px-[7px]'
                  : 'text-neutral-10 hover:bg-neutral-2 w-[144px] px-[7px]',
              ].join(' ')}
            >
              <span className="flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center">
                {item.icon}
              </span>
              {item.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
