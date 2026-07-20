import { useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DateRangeCalendar } from './DateRangeCalendar'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { formatDate } from '../utils/formatDate'

interface DateRangeFieldProps {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
}

// input(트리거) + 팝업 달력을 묶은 기간 선택 필드
// ※ 트리거는 임시 구현. 팀 Input 컴포넌트 머지되면 교체 예정
export function DateRangeField({ value, onChange }: DateRangeFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 팝업 바깥을 클릭하면 닫기
  useOutsideClick(containerRef, open, () => setOpen(false))

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* 트리거: 시작 ~ 종료 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-neutral-2 text-neutral-8 rounded-md px-4 py-2 text-left text-sm"
        >
          {formatDate(value?.from)}
        </button>
        <span className="text-neutral-6">~</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-neutral-2 text-neutral-8 rounded-md px-4 py-2 text-left text-sm"
        >
          {formatDate(value?.to)}
        </button>
      </div>

      {/* 팝업 달력 (열렸을 때만) */}
      {open && (
        <div className="border-neutral-3 absolute top-full left-0 z-10 mt-2 rounded-lg border bg-white shadow-lg">
          <DateRangeCalendar value={value} onChange={onChange} onComplete={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
