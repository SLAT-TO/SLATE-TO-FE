import { format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import { ko } from 'react-day-picker/locale'
import 'react-day-picker/style.css' // 기본 스타일 (색상은 확정 후 커스텀 예정)

interface DateCalendarProps {
  value?: Date
  onChange: (date: Date | undefined) => void
}

// 단일 날짜 선택 달력 코어 (마감일 등 하루만 고를 때)
export function DateSingleCalendar({ value, onChange }: DateCalendarProps) {
  const formatCaption = (date: Date) => format(date, 'yyyy.MM', { locale: ko })

  return (
    <DayPicker
      mode="single"
      showOutsideDays
      locale={ko} // 한국어 요일 라벨 + 일요일 시작
      selected={value}
      onSelect={onChange}
      modifiers={{
        sunday: { dayOfWeek: [0] },
        saturday: { dayOfWeek: [6] },
      }}
      modifiersClassNames={{
        sunday: 'text-warning',
        saturday: 'text-secondary',
        today: '!font-bold !text-blue-600',
      }}
      formatters={{ formatCaption }}
    />
  )
}
