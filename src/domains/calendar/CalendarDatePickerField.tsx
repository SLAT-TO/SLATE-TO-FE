import { format } from 'date-fns'

interface CalendarDatePickerFieldProps {
  value: Date | null
  active: boolean
  onClick: () => void
  placeholder?: string
}

const FIELD_CLASS =
  'text-body-sm flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-border-input bg-neutral-2 px-4 text-left transition-colors outline-none focus:border-primary'

// "기간" 날짜 선택 트리거. 실제 달력(CalendarMiniPicker)은 부모(EventFormModal)가 "기간" 행 아래에 가운데 정렬로 띄운다
export function CalendarDatePickerField({
  value,
  active,
  onClick,
  placeholder = '날짜를 선택해주세요.',
}: CalendarDatePickerFieldProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={active}
      onClick={onClick}
      className={FIELD_CLASS}
    >
      <span className={value ? 'text-neutral-10' : 'text-neutral-5'}>
        {value ? format(value, 'yyyy.MM.dd') : placeholder}
      </span>
    </button>
  )
}
