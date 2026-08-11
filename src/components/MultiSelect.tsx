import { useEffect, useRef, useState } from 'react'
import InlineIcon from './InlineIcon'
import { DROPDOWN_PANEL_BASE } from '../styles/dropdown'
import chevronDownIcon from '../assets/icons/chevron-down.svg?raw'
import checkboxIcon from '../assets/icons/checkbox.svg?raw'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: ReadonlyArray<MultiSelectOption>
  /** 선택된 값 목록 */
  selected: string[]
  onChange: (values: string[]) => void
  label?: string
  required?: boolean
  placeholder?: string
  error?: string
  disabled?: boolean
}

const TRIGGER_CLASS =
  'text-body-sm flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-neutral-2 px-4 text-left transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60'

/** 드롭다운에서 여러 항목을 고르고, 선택한 항목은 아래에 칩으로 나열한다 */
function MultiSelect({
  options,
  selected,
  onChange,
  label,
  required = false,
  placeholder = '선택해주세요',
  error,
  disabled = false,
}: MultiSelectProps) {
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

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  const selectedOptions = options.filter((o) => selected.includes(o.value))

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <span className="text-caption-lg text-neutral-9 font-semibold">
          {label}
          {required && <span className="text-warning"> *</span>}
        </span>
      )}

      <div ref={containerRef} className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={!!error}
          onClick={() => setOpen((v) => !v)}
          className={`${TRIGGER_CLASS} ${
            error
              ? 'border-warning focus:border-warning'
              : 'border-border-input focus:border-primary'
          }`}
        >
          <span className="text-neutral-5 truncate">{placeholder}</span>
          <InlineIcon
            svg={chevronDownIcon}
            className={`text-neutral-5 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            className={`${DROPDOWN_PANEL_BASE} mt-1 max-h-60 w-full overflow-auto`}
          >
            {options.map((option) => {
              const checked = selected.includes(option.value)
              return (
                <li key={option.value} role="option" aria-selected={checked}>
                  <button
                    type="button"
                    onClick={() => toggle(option.value)}
                    className="hover:bg-neutral-2 flex h-10 w-full items-center justify-between gap-2 px-4 transition-colors"
                  >
                    <span className="text-caption-lg text-neutral-10 truncate">{option.label}</span>
                    {checked && (
                      <InlineIcon svg={checkboxIcon} className="text-primary size-4 shrink-0" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {selectedOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                aria-label={`${option.label} 제외`}
                className="bg-tag-role-bg text-tag-role-text text-caption-sm inline-flex h-6 items-center gap-1.5 rounded-[3px] px-3 font-semibold whitespace-nowrap"
              >
                {option.label}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <span className="text-caption-sm text-warning truncate">{error}</span>}
    </div>
  )
}

export default MultiSelect
