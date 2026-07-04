import { useEffect, useId, useRef, useState, type Ref } from 'react'

export interface ActionMenuItem {
  label: string
  onClick: () => void
  /** 삭제 등 파괴적 액션 강조 (text-warning) */
  danger?: boolean
  disabled?: boolean
}

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

const ActionMenu = ({
  items,
  disabled = false,
  ariaLabel = '더보기',
  className = '',
  ref,
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerId = useId()
  const menuId = useId()
  const isTriggerDisabled = disabled || items.length === 0

  // 트리거 바깥 클릭 또는 Esc로 닫기 (표준 dropdown 패턴)
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

  const handleSelect = (item: ActionMenuItem) => {
    if (item.disabled) return
    setOpen(false)
    item.onClick()
  }

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
        onClick={() => {
          if (isTriggerDisabled) return
          setOpen((v) => !v)
        }}
        className="focus-visible:ring-primary flex size-8 items-center justify-center rounded-md text-neutral-8 transition-colors hover:bg-neutral-2 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-neutral-4"
      >
        <svg viewBox="0 0 20 8" className="size-4" fill="currentColor" aria-hidden>
          <circle cx="2" cy="4" r="2" />
          <circle cx="10" cy="4" r="2" />
          <circle cx="18" cy="4" r="2" />
        </svg>
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="border-border bg-bg-primary absolute right-0 top-full z-10 mt-1 min-w-28 overflow-hidden rounded-md border shadow-md"
        >
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleSelect(item)}
                className={`text-body-sm focus-visible:ring-primary block w-full px-3 py-2 text-left hover:bg-neutral-2 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-neutral-4 ${
                  item.danger ? 'text-warning' : 'text-neutral-10'
                }`}
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

export default ActionMenu
