import { useRef, useState } from 'react'
import { DateSingleCalendar } from './DateSingleCalendar'
import { DATE_FIELD_CLASS } from './dateFieldStyles'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { formatDate } from '../utils/formatDate'

interface DateFieldProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  className?: string
}

// input(트리거) + 트리거 아래에 펼쳐지는 달력을 묶은 단일 날짜 선택 필드
export function DateSingleField({ value, onChange, className = '' }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 팝업 바깥을 클릭하면 닫기
  useOutsideClick(containerRef, open, () => setOpen(false))

  // 날짜 고르면 반영하고 닫기
  function handleChange(date: Date | undefined) {
    onChange(date)
    if (date) {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`inline-block ${className}`}>
      {/* 트리거 */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="날짜 선택"
        onClick={() => setOpen(true)}
        className={DATE_FIELD_CLASS}
      >
        <span className={value ? 'text-neutral-10' : 'text-neutral-5'}>{formatDate(value)}</span>
      </button>

      {/* 달력 (열렸을 때 트리거 아래에 가운데 정렬로 표시, 배경·테두리 없음) */}
      {open && (
        <div className="mt-10 flex justify-center">
          <DateSingleCalendar value={value} onChange={handleChange} />
        </div>
      )}
    </div>
  )
}
