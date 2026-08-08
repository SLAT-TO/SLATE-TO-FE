interface SelectableChipProps {
  label: string
  selected: boolean
  onToggle: () => void
  /** wide: 미사용(264x88) / region: 활동 역할·지역 화면(140~172px) / category: 영상 카테고리 화면(231x88) */
  variant: 'wide' | 'region' | 'category'
}

// 화면별 칩 치수 (Figma 스펙 고정값, lg=1024px부터 적용)
// region은 4열×172px가 768px(md) 뷰포트보다 넓어 넘치므로, lg 미만에서는 폭만 140px로
// 줄여 맞춘다 (높이·간격·행 수는 그대로라 '다음' 버튼 위치는 단계 간에 계속 일치함).
const variantClass = {
  wide: 'flex w-[264px] h-[88px] items-center justify-center whitespace-nowrap px-4',
  region: 'flex w-35 h-[88px] items-center justify-center whitespace-nowrap px-4 lg:w-[172px]',
  category: 'flex w-[231px] h-[88px] items-center justify-center whitespace-nowrap px-4',
} as const

// 온보딩 다중선택 그리드용 칩 버튼. 선택 시 파랑 채움, 미선택은 흰 배경.
// aria-pressed로 토글 상태를 스크린리더에 전달한다.
export function SelectableChip({ label, selected, onToggle, variant }: SelectableChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`text-body-sm rounded-[6.828px] font-normal shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${variantClass[variant]} ${
        selected
          ? 'bg-main-7 border-main-7 text-neutral-1'
          : 'border-neutral-5 bg-neutral-1 hover:bg-main-1 text-neutral-5 border-[0.75px]'
      }`}
    >
      {label}
    </button>
  )
}
