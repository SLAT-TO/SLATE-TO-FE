import { useState } from 'react'
import { addMonths, format, subMonths } from 'date-fns'
import { Calendar } from '../components/Calendar'
import { useCalendarStore } from '../stores/calendarStore'

// 월 이동 화살표 (피그마: 20x20 클릭 영역 안에 5.978x11.667 화살표, fill은 팔레트의 main-5)
function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="6"
      height="12"
      viewBox="0 0 6 12"
      fill="none"
      className={`fill-main-5 h-[11.667px] w-[5.978px] ${className}`}
    >
      <path d="M1.90613 6.42566C1.82803 6.34819 1.76603 6.25602 1.72372 6.15447C1.68142 6.05293 1.65964 5.944 1.65964 5.83399C1.65964 5.72398 1.68142 5.61506 1.72372 5.51351C1.76603 5.41196 1.82803 5.3198 1.90613 5.24233L5.73113 1.42566C5.80924 1.34819 5.87124 1.25602 5.91354 1.15447C5.95585 1.05293 5.97763 0.944004 5.97763 0.833994C5.97763 0.723984 5.95585 0.615062 5.91354 0.513513C5.87124 0.411964 5.80924 0.319796 5.73113 0.242327C5.575 0.0871179 5.36379 0 5.14363 0C4.92348 0 4.71227 0.0871179 4.55613 0.242327L0.731133 4.06733C0.262965 4.53608 0 5.17149 0 5.83399C0 6.4965 0.262965 7.13191 0.731133 7.60066L4.55613 11.4257C4.71135 11.5796 4.92085 11.6664 5.13947 11.6673C5.24914 11.668 5.35786 11.6469 5.45939 11.6055C5.56092 11.564 5.65327 11.5029 5.73113 11.4257C5.80924 11.3482 5.87124 11.256 5.91354 11.1545C5.95585 11.0529 5.97763 10.944 5.97763 10.834C5.97763 10.724 5.95585 10.6151 5.91354 10.5135C5.87124 10.412 5.80924 10.3198 5.73113 10.2423L1.90613 6.42566Z" />
    </svg>
  )
}

// index.css 팔레트의 main-1~10 (CSS 변수 참조라 팔레트 값이 바뀌어도 자동으로 따라감)
const EVENT_COLORS = Array.from({ length: 10 }, (_, i) => `var(--color-main-${i + 1})`)

function randomEventColor() {
  return EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
}

// 캘린더 화면(페이지). 데이터 소유 + 컴포넌트 콜백 처리 담당.
export function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const events = useCalendarStore((s) => s.events)
  const addEvent = useCalendarStore((s) => s.addEvent)
  const removeEvent = useCalendarStore((s) => s.removeEvent)

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* 월 이동 헤더 — 이건 페이지 책임 (컴포넌트 밖) */}
      <header className="mb-4 flex items-center justify-start gap-2.5">
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          aria-label="이전 달"
          className="bg-main-2 flex aspect-square h-5 w-5 shrink-0 items-center justify-center rounded-full"
        >
          <ChevronIcon className="-translate-x-px" />
        </button>
        <h2 className="text-neutral-11 text-base font-bold">{format(month, 'yyyy년 M월')}</h2>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="다음 달"
          className="bg-main-2 flex aspect-square h-5 w-5 shrink-0 items-center justify-center rounded-full"
        >
          <ChevronIcon className="translate-x-0.5px -scale-x-100" />
        </button>
      </header>

      <Calendar
        month={month}
        events={events}
        onDateClick={(date) => {
          const key = format(date, 'yyyy-MM-dd')
          addEvent({
            id: crypto.randomUUID(),
            startDate: key,
            endDate: key,
            title: '새 일정',
            color: randomEventColor(),
          })
        }}
        onEventClick={(event) => removeEvent(event.id)}
      />
    </div>
  )
}
