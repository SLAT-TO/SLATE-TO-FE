interface SwitchProps {
  checked: boolean // 켜짐/꺼짐 상태
  onChange: (checked: boolean) => void
  disabled?: boolean // 비활성 상태
  ariaLabel?: string // 스크린리더용 라벨 (예: "알림 켜기")
  className?: string
}

// on/off 토글 스위치 (크기 고정 48×28)
export function Switch({ checked, onChange, disabled = false, ariaLabel, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-neutral-5'
      } ${className ?? ''}`}
    >
      <span
        className={`bg-neutral-1 absolute top-1/2 left-1 h-5 w-5 -translate-y-1/2 rounded-full transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
