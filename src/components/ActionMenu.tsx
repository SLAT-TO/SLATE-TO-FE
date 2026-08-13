import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { ACTION_MENU_LABELS, type ActionMenuItem } from '../constants/actionMenu'
import { actionMenuItemClass, actionMenuPanelClass } from '../styles/dropdown'

interface ActionMenuProps {
  /** 항목·onClick은 전부 사용하는 화면(부모)이 소유 — ActionMenu는 렌더링만 담당 */
  items: ActionMenuItem[]
  disabled?: boolean
  /** 스크린 리더용 트리거 이름 (기본: 더보기) */
  ariaLabel?: string
  className?: string
  /** 트리거 버튼 DOM 참조 */
  ref?: Ref<HTMLButtonElement>
}

const PANEL_CLASS = actionMenuPanelClass

const ITEM_CLASS = actionMenuItemClass

const ActionMenu = memo(function ActionMenu({
  items,
  disabled = false,
  ariaLabel = '더보기',
  className = '',
  ref,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const triggerId = useId()
  const menuId = useId()
  const isTriggerDisabled = disabled || items.length === 0

  // 메뉴를 document.body에 포탈로 띄우기 때문에(스크롤 컨테이너에 잘리는 문제 방지),
  // CSS만으로는 트리거에 붙일 수 없어 열릴 때마다 트리거 위치를 직접 읽어 계산한다.
  useLayoutEffect(() => {
    if (!open) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // 트리거가 스크롤 컨테이너 안에 있을 수 있어, 스크롤되면 위치가 어긋나기 전에 닫는다
    const handleScroll = () => setOpen(false)

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  const handleSelect = useCallback((item: ActionMenuItem) => {
    if (item.disabled) return
    setOpen(false)
    item.onClick()
  }, [])

  const handleToggle = useCallback(() => {
    if (isTriggerDisabled) return
    setOpen((v) => !v)
  }, [isTriggerDisabled])

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={(node) => {
          triggerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type="button"
        id={triggerId}
        disabled={isTriggerDisabled}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleToggle}
        className="focus-visible:ring-primary text-neutral-8 hover:bg-neutral-2 disabled:text-neutral-4 flex size-8 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 8 20" className="size-4" fill="currentColor" aria-hidden>
          <circle cx="4" cy="2" r="2" />
          <circle cx="4" cy="10" r="2" />
          <circle cx="4" cy="18" r="2" />
        </svg>
      </button>

      {open &&
        position &&
        createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            className={PANEL_CLASS}
            style={{ position: 'fixed', top: position.top, right: position.right }}
          >
            {items.map((item) => (
              <li key={item.action} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  className={ITEM_CLASS}
                >
                  {item.label ?? ACTION_MENU_LABELS[item.action]}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
})

export default ActionMenu
