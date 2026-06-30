//현재 ts.config의 기본 설정으로 리엑트 관련 타입들은 import 없이 사용할 수 있지만 명시적으로 표시
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  /** 선택된 값 (controlled). 미선택은 '' */
  value: string
  /** 이벤트 대신 선택된 값(string)만 넘김 -> 상태 도구(useState·Context·zustand) 무관하게 연결 */
  onChange: (value: string) => void
  /** 포커스가 빠져나갈 때 호출 -> blur 시점 검증(validateField) 트리거용 */
  onBlur?: (e: FocusEvent<HTMLButtonElement>) => void
  placeholder?: string
  label?: string
  /** true면 label 옆에 * 표시 */
  required?: boolean
  /** 안내 문구 -> error가 없을 때만 표시 (error 우선) */
  hint?: string
  error?: string
  disabled?: boolean
  /** 네이티브 form 제출·식별용 (hidden input으로 값 전달) */
  name?: string
  /** label의 htmlFor와 연결될 id. 미전달 시 useId 폴백 */
  id?: string
  className?: string
  /** 트리거 버튼 DOM 참조 (외부 포커스 제어용) */
  ref?: Ref<HTMLButtonElement>
}

// 콤보박스(직접입력)·다중선택·검색은 회의 후 확장 예정. 지금은 일반 단일선택만.
const Select = ({
  options,
  value,
  onChange,
  onBlur,
  placeholder = '선택해주세요',
  label,
  required = false,
  hint,
  error,
  disabled = false,
  name,
  id,
  className = '',
  ref,
}: SelectProps) => {
  // 부모가 id를 안 넘겨도 label-트리거 연결이 깨지지 않도록 폴백 id 생성
  const reactId = useId()
  const triggerId = id ?? reactId

  const message = error ?? hint

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const openList = () => {
    if (options.length === 0) setActiveIndex(-1)
    else {
      const idx = options.findIndex((o) => o.value === value)
      setActiveIndex(idx >= 0 ? idx : 0)
    }
    setOpen(true)
  }

  const choose = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) openList()
        else if (options.length > 0)
          setActiveIndex((i) => (i + 1 > options.length - 1 ? options.length - 1 : i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) openList()
        else if (options.length > 0) setActiveIndex((i) => (i - 1 < 0 ? 0 : i - 1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open && activeIndex >= 0 && options[activeIndex]) choose(options[activeIndex].value)
        else openList()
        break
      case 'Escape':
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className={`flex w-full flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={triggerId} className="text-caption-lg text-neutral-9 font-semibold">
          {label}
          {required && <span className="text-warning"> *</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={ref}
          id={triggerId}
          type="button"
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openList())}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          className={`text-body-sm flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors outline-none ${
            error ? 'border-warning focus:border-warning' : 'border-border focus:border-primary'
          } ${disabled ? 'bg-neutral-2 cursor-not-allowed' : 'bg-bg-primary cursor-pointer'}`}
        >
          <span className={selected ? 'text-neutral-10' : 'text-neutral-5'}>
            {selected?.label ?? placeholder}
          </span>
          {/* chevron: 열리면 180도 회전 */}
          <svg
            viewBox="0 0 20 20"
            className={`text-neutral-5 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <ul className="border-border bg-bg-primary absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border py-1 shadow-md">
            {options.map((o, i) => {
              const isSelected = o.value === value
              const isActive = i === activeIndex
              return (
                <li
                  key={o.value}
                  // 트리거가 blur되어 목록이 닫히기 전에 클릭이 처리되도록 mousedown 기본동작 차단
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(o.value)}
                  className={`text-body-sm cursor-pointer px-3 py-2 ${isActive ? 'bg-neutral-2' : ''} ${
                    isSelected ? 'text-primary font-semibold' : 'text-neutral-10'
                  }`}
                >
                  {o.label}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* 네이티브 form 제출용 (커스텀 트리거는 버튼이라 값이 안 실리므로 hidden input 동반) */}
      {name && <input type="hidden" name={name} value={value} />}

      {message && (
        <span className={`text-caption-sm truncate ${error ? 'text-warning' : 'text-neutral-5'}`}>
          {message}
        </span>
      )}
    </div>
  )
}

export default Select
