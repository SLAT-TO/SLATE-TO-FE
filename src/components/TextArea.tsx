//현재 ts.config의 기본 설정으로 리엑트 관련 타입들은 import 없이 사용할 수 있지만 명시적으로 표시
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type Ref,
} from 'react'

interface TextAreaProps {
  /** label의 htmlFor와 연결되어야 클릭 시 textarea로 포커스 이동됨 -> 안 넘기면 useId 폴백 id로 연결 */
  id?: string
  /** 폼 필드 식별자 (네이티브 form 제출·식별용, 선택적) */
  name?: string
  value: string
  /** 이벤트 대신 값(string)만 넘김 -> 상태 도구(useState·Context·zustand) 무관하게 연결 가능 */
  onChange: (value: string) => void
  /** 포커스가 빠져나갈 때 호출 -> blur 시점 검증(zod 등) 트리거용 */
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  /** 입력값에 따라 크기가 변하는 설정 (자동 크기 조절) */
  autoResize?: boolean
  /** autoResize일 때 늘어날 수 있는 최대 높이(px). 이후엔 스크롤로 처리됨 */
  maxHeight?: number
  disabled?: boolean
  error?: string
  /** 안내 문구 -> error가 없을 때만 표시 (error 우선) */
  hint?: string
  label?: string
  /** true면 label 옆에 * 표시 + aria-required 부여 */
  required?: boolean
  /** 외부에서 추가적으로 스타일을 주입할 수 있는 속성 -> 사용할때 필요시 사용 */
  className?: string
  /** React 19부터 forwardRef 없이 ref를 prop으로 받음 -> 부모 ref가 내부 textarea DOM까지 전달됨 (외부 포커스 제어용) */
  ref?: Ref<HTMLTextAreaElement>
}

const TextArea = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  maxLength,
  autoResize = false,
  maxHeight = 240,
  disabled = false,
  error,
  hint,
  label,
  required = false,
  className = '',
  ref,
}: TextAreaProps) => {
  // autoResize가 마운트 시점/외부 value 변경(reset 등)에도 반응하려면 DOM에 직접 접근할 ref가 필요 -> 부모 ref와 별개로 내부 ref 유지
  const innerRef = useRef<HTMLTextAreaElement>(null)

  // 부모가 id를 안 넘겨도 label-textarea, error 연결이 깨지지 않도록 폴백 id 생성
  const reactId = useId()
  const inputId = id ?? reactId

  // 같은 node를 내부 ref와 부모 ref에 동시에 연결 -> ref는 매 렌더마다 새 함수면 React가 초기화되기에 useCallback으로 고정
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      // 부모 ref는 콜백형(ref(node))과 객체형(ref.current) 둘 다 들어올 수 있어 분기 처리
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  // 타이핑(onChange)뿐 아니라 마운트 시 초기값, 외부에서 value를 바꾸는 경우(reset 등) 크기 조절을 위한 effect 처리
  // 화면에 그려지기 전에 높이를 맞춰야 늘어나기 전 모습이 잠깐 보이는 깜빡임이 없어 useLayoutEffect 사용
  useLayoutEffect(() => {
    if (!autoResize || !innerRef.current) return
    // height를 auto로 먼저 초기화해야 텍스트 삭제 시 scrollHeight가 줄어든 값으로 재계산됨
    innerRef.current.style.height = 'auto'
    // maxHeight 이상은 늘리지 않고 textarea 자체 스크롤(overflow-y-auto)로 넘김
    innerRef.current.style.height = `${Math.min(innerRef.current.scrollHeight, maxHeight)}px`
  }, [autoResize, value, maxHeight])

  // 부모엔 이벤트 대신 값(string)만 넘김 -> 추후 가공/검증 로직 끼우기 쉽게 핸들러로 감싸둠
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // error가 hint보다 우선. 표시할 메시지를 textarea와 연결해야 스크린리더가 같이 읽어줌 (폴백 id 덕분에 항상 연결 가능)
  const message = error ?? hint
  const messageId = message ? `${inputId}-desc` : undefined

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-caption-lg text-neutral-9 font-semibold">
          {label}
          {required && <span className="text-warning"> *</span>}
        </label>
      )}
      <textarea
        ref={setRefs}
        id={inputId}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={messageId}
        className={`text-body-sm text-neutral-10 placeholder:text-neutral-5 w-full resize-none overflow-y-auto rounded-md border px-3 py-2 transition-colors outline-none ${
          error ? 'border-warning focus:border-warning' : 'border-border focus:border-primary'
        } ${disabled ? 'bg-neutral-2 text-neutral-8 cursor-not-allowed' : 'bg-bg-primary'} ${className}`}
      />
      {(message || typeof maxLength === 'number') && (
        //에러/힌트 메시지가 있거나 maxLength가 있을때만 렌더링 (error 우선, 없으면 hint)
        <div className="flex justify-between gap-2">
          <span
            id={messageId}
            className={`text-caption-sm truncate ${error ? 'text-warning' : 'text-neutral-5'}`}
          >
            {message}
          </span>
          {typeof maxLength === 'number' && (
            <span className="text-caption-sm text-neutral-5 shrink-0 whitespace-nowrap">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default TextArea
