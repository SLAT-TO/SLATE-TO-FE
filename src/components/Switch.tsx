interface SwitchProps {
  checked: boolean // 켜짐/꺼짐 상태
  onChange: (checked: boolean) => void
  disabled?: boolean // 비활성 상태
  ariaLabel?: string // 스크린리더용 라벨 (예: "알림 켜기")
  className?: string
}

// on/off 토글 스위치 (크기 고정 58×31)
// ※ 색상 미정 — 스펙 준 기본값(검정 테두리, 흰 배경, 회색 동그라미)으로, 확정 후 커스텀 예정
export function Switch({ checked, onChange, disabled = false, ariaLabel, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[58px] shrink-0 rounded-[15.5px] border border-black bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
    >
      <span
        className={`absolute top-1/2 left-[3px] h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-[#D9D9D9] transition-transform ${
          checked ? 'translate-x-[28px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
