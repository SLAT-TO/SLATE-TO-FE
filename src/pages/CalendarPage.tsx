import { useState } from 'react'
import { addMonths, format, subMonths } from 'date-fns'
import { Calendar } from '../components/Calendar'
import { useCalendarStore } from '../stores/calendarStore'

// 캘린더 화면(페이지). 데이터 소유 + 컴포넌트 콜백 처리 담당.
export function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const events = useCalendarStore((s) => s.events)
  const addEvent = useCalendarStore((s) => s.addEvent)
  const removeEvent = useCalendarStore((s) => s.removeEvent)

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* 월 이동 헤더 — 이건 페이지 책임 (컴포넌트 밖) */}
      <header className="mb-4 flex items-center justify-start gap-3">
        <h2 className="text-base font-bold text-black">{format(month, 'yyyy년 M월')}</h2>
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          className="rounded-md px-1 py-1 hover:bg-gray-100"
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="rounded-md px-1 py-1 hover:bg-gray-100"
        >
          &gt;
        </button>
      </header>

      <Calendar
        month={month}
        events={events}
        onDateClick={(date) =>
          addEvent({
            id: crypto.randomUUID(),
            date: format(date, 'yyyy-MM-dd'),
            title: '새 일정',
          })
        }
        onEventClick={(event) => removeEvent(event.id)}
      />
    </div>
  )
}
