import { useRef, useState } from 'react'
import { DateRangeCalendar, type DateRangeValue } from './DateRangeCalendar'
import { DATE_FIELD_CLASS } from './dateFieldStyles'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { formatDate } from '../utils/formatDate'

interface DateRangeFieldProps {
  value?: DateRangeValue
  onChange: (range: DateRangeValue | undefined) => void
}

// input(트리거) + 트리거 아래에 펼쳐지는 달력을 묶은 기간 선택 필드
export function DateRangeField({ value, onChange }: DateRangeFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 팝업 바깥을 클릭하면 닫기
  useOutsideClick(containerRef, open, () => setOpen(false))

  return (
    <div ref={containerRef} className="inline-block">
      {/* 트리거: 시작 ~ 종료 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="시작일 선택"
          onClick={() => setOpen(true)}
          className={`${DATE_FIELD_CLASS} flex-1`}
        >
          <span className={value?.from ? 'text-neutral-10' : 'text-neutral-5'}>
            {formatDate(value?.from)}
          </span>
        </button>
        <span className="text-neutral-6">~</span>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="종료일 선택"
          onClick={() => setOpen(true)}
          className={`${DATE_FIELD_CLASS} flex-1`}
        >
          <span className={value?.to ? 'text-neutral-10' : 'text-neutral-5'}>
            {formatDate(value?.to)}
          </span>
        </button>
      </div>

      {/* 달력 (열렸을 때 트리거 아래에 가운데 정렬로 표시, 배경·테두리 없음) */}
      {open && (
        <div className="mt-10 flex justify-center">
          <DateRangeCalendar value={value} onChange={onChange} onComplete={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
