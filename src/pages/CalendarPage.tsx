import { useState } from 'react'
import { addMonths, format, subMonths } from 'date-fns'
import { Calendar } from '../components/Calendar'
import { useCalendarStore } from '../stores/calendarStore'

// 캘린더 화면(페이지). 데이터 소유 + 컴포넌트 콜백 처리 담당.
// 월 이동 헤더 UI는 최소 구현만 두고, 화면 디자인은 #114(캘린더 화면 PR)에서 맞춘다.
export function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const events = useCalendarStore((s) => s.events)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-4 flex items-center gap-3">
        <h2 className="text-neutral-11 text-base font-bold">{format(month, 'yyyy년 M월')}</h2>
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          className="hover:bg-neutral-2 rounded-md px-1 py-1"
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="hover:bg-neutral-2 rounded-md px-1 py-1"
        >
          &gt;
        </button>
      </header>

      <Calendar month={month} events={events} />
    </div>
  )
}
