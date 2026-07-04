//현재 ts.config의 기본 설정으로 리엑트 관련 타입들은 import 없이 사용할 수 있지만 명시적으로 표시
import { useId, type FocusEvent, type Ref } from 'react'

type ChoiceType = 'checkbox' | 'radio'

interface ChoiceProps {
  /** checkbox: 독립 토글 / radio: 같은 name을 공유하는 그룹 내 단일 선택 */
  type: ChoiceType
  /** 선택 상태 (controlled) */
  checked: boolean
  /** 이벤트 대신 상태(boolean)만 넘김 -> 상태 도구(useState·Context·zustand) 무관하게 연결 */
  onChange: (checked: boolean) => void
  /** 포커스가 빠져나갈 때 호출 -> blur 시점 검증(validateField) 트리거용 */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  label?: string
  /** true면 input에 aria-required (옵션 라벨 옆 *는 ChoiceGroup·페이지에서 처리) */
  required?: boolean
  /** radio 그룹 식별자 (radio일 때 같은 그룹끼리 동일 name 필요) / form 제출·식별용 */
  name?: string
  /** 폼 제출·식별용 값 (radio 그룹에서 어떤 항목인지 구분) */
  value?: string
  disabled?: boolean
  /** label의 htmlFor와 연결될 id. 미전달 시 useId 폴백 */
  id?: string
  /** 외부에서 추가 스타일 주입 (필요시) */
  className?: string
  /** input DOM 참조 (외부 포커스 제어용) */
  ref?: Ref<HTMLInputElement>
}

const Choice = ({
  type,
  checked,
  onChange,
  onBlur,
  label,
  required = false,
  name,
  value,
  disabled = false,
  id,
  className = '',
  ref,
}: ChoiceProps) => {
  // 부모가 id를 안 넘겨도 label-input 연결이 깨지지 않도록 폴백 id 생성
  const reactId = useId()
  const inputId = id ?? reactId

  const showCheck = type === 'checkbox' && checked
  const showDot = type === 'radio' && checked

  // 상태 색: checkbox는 채움(bg-primary), radio는 테두리만 강조 후 안쪽 점. disabled는 neutral 토큰
  const stateClass = disabled
    ? checked
      ? 'border-neutral-4 bg-neutral-3 text-neutral-5'
      : 'border-border bg-neutral-2 text-transparent'
    : checked
      ? type === 'checkbox'
        ? 'border-primary bg-primary text-white'
        : 'border-primary bg-bg-primary'
      : 'border-border bg-bg-primary text-transparent'

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* 실제 컨트롤: 화면에서 숨기되 포커스·키보드·폼 제출은 유지(sr-only). peer로 포커스 링 연동 */}
      <input
        ref={ref}
        id={inputId}
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        onBlur={onBlur}
        aria-required={required || undefined}
        aria-checked={checked}
        className="peer sr-only"
      />
      {/* 커스텀 인디케이터 (checkbox=사각 / radio=원형) */}
      <span
        aria-hidden
        className={`peer-focus-visible:ring-primary flex size-5 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 ${type === 'radio' ? 'rounded-full' : 'rounded-md'} ${stateClass}`}
      >
        {showCheck && (
          <svg
            viewBox="0 0 20 20"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {showDot && (
          <span className={`size-2 rounded-full ${disabled ? 'bg-neutral-5' : 'bg-primary'}`} />
        )}
      </span>
      {label && (
        <span className={`text-body-sm ${disabled ? 'text-neutral-8' : 'text-neutral-10'}`}>
          {label}
        </span>
      )}
    </label>
  )
}

export default Choice
