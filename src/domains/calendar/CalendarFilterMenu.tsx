import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import InlineIcon from '../../components/InlineIcon'
import { DROPDOWN_PANEL_BASE, DROPDOWN_ITEM_BASE } from '../../styles/dropdown'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'

export interface CalendarFilterOption {
  value: string
  label: string
}

interface CalendarFilterMenuProps {
  options: ReadonlyArray<CalendarFilterOption>
  /** 선택된 프로젝트 필터. 미선택은 null (부모가 소유하는 controlled 값) */
  value: string | null
  onChange: (value: string | null) => void
}

// 캘린더 상단의 "일정 필터" 버튼 + 드롭다운. 선택 상태는 부모(CalendarPage)가 소유한다.
export function CalendarFilterMenu({ options, value, onChange }: CalendarFilterMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        variant="secondary"
        size="sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        width={200}
      >
        <span className="flex w-full items-center justify-center gap-1">
          일정 필터
          <InlineIcon
            svg={chevronDownIcon}
            className={`text-primary size-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </Button>

      {open && (
        <ul
          role="listbox"
          className={`${DROPDOWN_PANEL_BASE} absolute top-full right-0 z-10 mt-1 w-50 overflow-hidden`}
        >
          <li role="none">
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={`${DROPDOWN_ITEM_BASE} ${value === null ? 'text-primary font-semibold' : ''}`}
            >
              관련 프로젝트 없음
            </button>
          </li>
          {options.map((option) => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`${DROPDOWN_ITEM_BASE} ${value === option.value ? 'text-primary font-semibold' : ''}`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
