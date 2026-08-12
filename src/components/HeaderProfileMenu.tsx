import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { navigate } from '../utils/navigation'
import { actionMenuItemClass, actionMenuPanelClass } from '../styles/dropdown'
import { Avatar } from './Avatar'

interface HeaderProfileMenuProps {
  userName: string
  profileImageUrl?: string | null
}

const MENU_ITEMS = [
  { label: '나의 구인구직', path: '/matching/my' },
  { label: '마이페이지', path: '/mypage' },
  { label: '설정', path: '/settings' },
] as const

export default function HeaderProfileMenu({ userName, profileImageUrl }: HeaderProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerId = useId()
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSelect = useCallback((path: string) => {
    setOpen(false)
    navigate(path)
  }, [])

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        id={triggerId}
        aria-label="프로필"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="hover:opacity-80"
      >
        <Avatar
          src={profileImageUrl ?? undefined}
          size={40}
          fallback={
            <span className="bg-neutral-3 text-caption-sm text-neutral-7 flex h-full w-full items-center justify-center font-medium">
              {userName.charAt(0)}
            </span>
          }
        />
      </button>

      {open && (
        <ul id={menuId} role="menu" aria-labelledby={triggerId} className={actionMenuPanelClass}>
          {MENU_ITEMS.map((item) => (
            <li key={item.path} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => handleSelect(item.path)}
                className={actionMenuItemClass}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
