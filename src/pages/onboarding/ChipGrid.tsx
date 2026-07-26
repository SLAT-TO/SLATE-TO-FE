import { SelectableChip } from './SelectableChip'

interface ChipGridOption {
  value: string
  label: string
}

interface ChipGridProps {
  options: ReadonlyArray<ChipGridOption>
  /** 선택된 값 목록 (다중선택) */
  selected: ReadonlyArray<string>
  onToggle: (value: string) => void
  /** 한 줄에 표시할 칩 개수 */
  columns: 2 | 4
}

// columns 값을 명시적 클래스로 매핑 (Tailwind가 동적 문자열을 스캔 못 하므로 정적 매핑)
// 칩이 고정폭(264px/172px)이라 1fr 기반 grid-cols를 쓰면 칩이 트랙보다 넓어져 간격이 어긋난다.
// 트랙 폭 자체를 칩 폭으로 고정하고 justify-center로 그리드를 가운데 배치한다.
// 지역(4열)도 항상 4열로 고정한다. 모바일에서 2열로 줄어들면 행 수가 늘어나
// 역할·카테고리(3행)와 그리드 전체 높이가 크게 어긋나 '다음' 버튼 위치가 달라지기 때문.
// lg(1024px) 미만에서는 트랙 폭도 SelectableChip의 축소 폭(140px)에 맞춘다.
const columnClass: Record<ChipGridProps['columns'], string> = {
  2: 'grid-cols-[repeat(2,264px)] justify-center',
  4: 'grid-cols-[repeat(4,140px)] justify-center lg:grid-cols-[repeat(4,172px)]',
}

// columns=4(활동 지역)만 region 사이즈, 나머지(역할·영상 카테고리)는 wide 사이즈
const chipVariant: Record<ChipGridProps['columns'], 'wide' | 'region'> = {
  2: 'wide',
  4: 'region',
}

// 화면별 칩 간격 (가로는 피그마 스펙 고정값, 세로는 32px로 통일해 그리드 전체 높이를 맞춘다)
const gapClass: Record<ChipGridProps['columns'], string> = {
  2: 'gap-x-15.5 gap-y-8',
  4: 'gap-x-[43px] gap-y-8',
}

// 고정폭 칩 개수 × 칩 너비 + 칩 사이 gap = 실제 그리드 너비.
// max-w-lg(512px) 고정값을 쓰면 칩(264px/172px)이 컬럼 폭보다 넓어져 간격이 깨지므로 컬럼 수별로 계산한다.
// 2컬럼: 264*2 + 62 = 590px / 4컬럼: 172*4 + 43*3 = 817px
const maxWidthClass: Record<ChipGridProps['columns'], string> = {
  2: 'max-w-[590px]',
  4: 'max-w-[817px]',
}

// 온보딩 1~3단계 공통 — 옵션 칩을 격자로 배치한 다중선택 그리드.
export function ChipGrid({ options, selected, onToggle, columns }: ChipGridProps) {
  return (
    <div
      className={`mx-auto grid ${maxWidthClass[columns]} ${gapClass[columns]} ${columnClass[columns]}`}
    >
      {options.map((option) => (
        <SelectableChip
          key={option.value}
          label={option.label}
          selected={selected.includes(option.value)}
          onToggle={() => onToggle(option.value)}
          variant={chipVariant[columns]}
        />
      ))}
    </div>
  )
}
