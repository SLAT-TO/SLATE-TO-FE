import { useState } from 'react'
import { format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { ko } from 'react-day-picker/locale'
import 'react-day-picker/style.css' // 기본 스타일 (색상은 확정 후 커스텀 예정)

interface DateRangeCalendarProps {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  onComplete?: () => void // 시작~종료 다 골랐을 때
}

// 기간 선택 달력 코어 (input·팝업 없이 달력만)
// 동작: 첫 클릭 → 시작일=종료일(하루), 이후 클릭 → 종료일 선택
export function DateRangeCalendar({ value, onChange, onComplete }: DateRangeCalendarProps) {
  // 종료일을 기다리는 중인지 (첫 클릭 후 true)
  const [awaitingEnd, setAwaitingEnd] = useState(false)

  const formatCaption = (date: Date) => format(date, 'yyyy.MM', { locale: ko })

  function handleDayClick(day: Date) {
    // 새 시작: 클릭한 날을 시작일=종료일로 채움 (하루짜리)
    if (!value?.from || !awaitingEnd) {
      onChange({ from: day, to: day })
      setAwaitingEnd(true)
      return
    }

    // 종료일 선택 중인데 시작일보다 앞을 누르면 → 그 날을 새 시작으로
    if (day < value.from) {
      onChange({ from: day, to: day })
      setAwaitingEnd(true)
      return
    }

    // 종료일 확정 → 범위 완성
    onChange({ from: value.from, to: day })
    setAwaitingEnd(false)
    onComplete?.() // 범위 완성 → 알림
  }

  return (
    <DayPicker
      showOutsideDays
      locale={ko} // 한국어 요일 라벨 + 일요일 시작
      modifiers={{
        selected: value,
        range_start: value?.from,
        range_end: value?.to,
        range_middle:
          value?.from && value?.to ? { after: value.from, before: value.to } : undefined,
        sunday: { dayOfWeek: [0] },
        saturday: { dayOfWeek: [6] },
      }}
      modifiersClassNames={{
        sunday: 'text-warning',
        saturday: 'text-secondary',
        today: '!font-bold !text-blue-600',
      }}
      onDayClick={handleDayClick}
      formatters={{ formatCaption }}
    />
  )
}
