import { useState } from 'react'

type InputProps = {
  id?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  hint?: string
  label?: string
  required?: boolean
  /** type="password"에 눈 아이콘으로 값 표시/숨김 토글 추가 */
  showPasswordToggle?: boolean
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g transform="translate(0, 2.65)">
        <path
          fill="currentColor"
          d="M23.2754 6.764C21.7244 4.238 18.1964 0 12.0044 0C5.81245 0 2.28445 4.238 0.733446 6.764C0.253974 7.53951 0 8.43324 0 9.345C0 10.2568 0.253974 11.1505 0.733446 11.926C2.28445 14.452 5.81245 18.69 12.0044 18.69C18.1964 18.69 21.7244 14.452 23.2754 11.926C23.7549 11.1505 24.0089 10.2568 24.0089 9.345C24.0089 8.43324 23.7549 7.53951 23.2754 6.764V6.764ZM21.5704 10.879C20.2384 13.045 17.2234 16.69 12.0044 16.69C6.78545 16.69 3.77045 13.045 2.43845 10.879C2.15358 10.418 2.0027 9.88687 2.0027 9.345C2.0027 8.80313 2.15358 8.27196 2.43845 7.811C3.77045 5.645 6.78545 2 12.0044 2C17.2234 2 20.2384 5.641 21.5704 7.811C21.8553 8.27196 22.0062 8.80313 22.0062 9.345C22.0062 9.88687 21.8553 10.418 21.5704 10.879V10.879Z"
        />
      </g>
      <g transform="translate(7, 7)">
        <path
          fill="currentColor"
          d="M5 0C4.0111 0 3.0444 0.293245 2.22215 0.842652C1.39991 1.39206 0.759043 2.17295 0.380605 3.08658C0.00216642 4.00021 -0.0968503 5.00555 0.0960759 5.97545C0.289002 6.94536 0.765206 7.83627 1.46447 8.53553C2.16373 9.2348 3.05465 9.711 4.02455 9.90393C4.99446 10.0969 5.99979 9.99784 6.91342 9.6194C7.82705 9.24096 8.60794 8.6001 9.15735 7.77785C9.70676 6.95561 10 5.98891 10 5C9.99841 3.67441 9.47112 2.40356 8.53378 1.46622C7.59644 0.528882 6.3256 0.00158786 5 0V0ZM5 8C4.40666 8 3.82664 7.82405 3.33329 7.49441C2.83994 7.16477 2.45543 6.69623 2.22836 6.14805C2.0013 5.59987 1.94189 4.99667 2.05765 4.41473C2.1734 3.83279 2.45912 3.29824 2.87868 2.87868C3.29824 2.45912 3.83279 2.1734 4.41473 2.05764C4.99667 1.94189 5.59987 2.0013 6.14805 2.22836C6.69623 2.45542 7.16477 2.83994 7.49441 3.33329C7.82406 3.82664 8 4.40666 8 5C8 5.79565 7.68393 6.55871 7.12132 7.12132C6.55871 7.68393 5.79565 8 5 8Z"
        />
      </g>
    </svg>
  )
}

export default function Input({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  hint,
  label,
  required = false,
  showPasswordToggle = false,
}: InputProps) {
  const [visible, setVisible] = useState(false)
  const borderClass = error ? 'border-warning' : 'border-neutral-3 focus:border-primary'
  const resolvedType = showPasswordToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-caption-lg text-neutral-9 font-semibold">
          {label}
          {required && <span className="text-warning ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-required={required}
          className={`bg-neutral-2 text-body-sm text-neutral-10 placeholder:text-neutral-5 h-12 w-full rounded-lg border px-4 py-3 transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-40 ${showPasswordToggle ? 'pr-12' : ''} ${borderClass}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
            className="text-neutral-5 absolute top-1/2 right-4 -translate-y-1/2"
          >
            <EyeIcon />
          </button>
        )}
      </div>
      {error && <p className="text-caption-sm text-warning">{error}</p>}
      {!error && hint && <p className="text-caption-sm text-neutral-5">{hint}</p>}
    </div>
  )
}
