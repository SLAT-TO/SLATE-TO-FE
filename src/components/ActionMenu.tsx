import { memo, useCallback, useEffect, useId, useRef, useState, type Ref } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerId = useId()
  const menuId = useId()
  const isTriggerDisabled = disabled || items.length === 0

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
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        ref={ref}
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

      {open && (
        <ul id={menuId} role="menu" aria-labelledby={triggerId} className={PANEL_CLASS}>
          {items.map((item) => (
            <li key={item.action} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleSelect(item)}
                className={ITEM_CLASS}
              >
                {ACTION_MENU_LABELS[item.action]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

export default ActionMenu
