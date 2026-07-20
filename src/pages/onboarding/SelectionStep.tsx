import { Button } from '../../components/Button'
import { ChipGrid } from './ChipGrid'
import { OnboardingLayout } from './OnboardingLayout'

interface SelectionStepProps {
  title: string
  subtitle?: string
  options: ReadonlyArray<{ value: string; label: string }>
  selected: ReadonlyArray<string>
  onToggle: (value: string) => void
  columns: 2 | 4
  onNext: () => void
}

// 역할·지역·카테고리 단계 공통 — 칩 그리드 + '다음' 버튼.
// 최소 1개는 선택해야 다음으로 진행 가능.
export function SelectionStep({
  title,
  subtitle = '중복 선택 가능, 나중에 변경할 수 있어요',
  options,
  selected,
  onToggle,
  columns,
  onNext,
}: SelectionStepProps) {
  return (
    <OnboardingLayout
      title={title}
      subtitle={subtitle}
      contentGapClassName="mt-16"
      footerGapClassName="mt-19.25"
      footer={
        <Button fullWidth onClick={onNext} disabled={selected.length === 0}>
          다음
        </Button>
      }
    >
      <ChipGrid options={options} selected={selected} onToggle={onToggle} columns={columns} />
    </OnboardingLayout>
  )
}
