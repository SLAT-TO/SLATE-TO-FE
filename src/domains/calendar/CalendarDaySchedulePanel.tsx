import type { CalendarEvent } from '../../schemas/calendarEvent'
import { useCalendarStore } from '../../stores/calendarStore'
import { EventDetailCard } from './EventDetailCard'

interface CalendarDaySchedulePanelProps {
  date: Date
  events: CalendarEvent[]
  /** 카드의 뒤로가기 — 목록 단계가 없으므로 날짜 선택 자체를 해제한다 */
  onDeselect: () => void
  /** "수정하기" 클릭 시 — 일정 추가 폼을 이 일정 데이터로 채워서 열도록 부모(CalendarPage)에 위임 */
  onEditEvent: (event: CalendarEvent) => void
}

const PANEL_SHADOW = 'shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]'

// 날짜 클릭 시 오른쪽에 뜨는 패널. 일정이 없으면 안내 문구, 있으면 해당 날짜의 모든 일정을 카드로 바로 보여준다.
export function CalendarDaySchedulePanel({
  date,
  events,
  onDeselect,
  onEditEvent,
}: CalendarDaySchedulePanelProps) {
  const removeEvent = useCalendarStore((s) => s.removeEvent)
  const updateEvent = useCalendarStore((s) => s.updateEvent)

  if (events.length === 0) {
    return (
      <div
        className={`flex w-80 flex-col items-center justify-center rounded-[10.242px] bg-white ${PANEL_SHADOW}`}
      >
        <p className="text-caption-sm text-neutral-5 font-normal tracking-[-0.24px] capitalize">
          등록된 일정이 없습니다
        </p>
      </div>
    )
  }

  return (
    <div
      className={`flex w-80 flex-col gap-5 overflow-auto rounded-[10.242px] bg-white p-6 ${PANEL_SHADOW}`}
    >
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`flex w-67.5 flex-col gap-5 ${
            index < events.length - 1 ? 'border-neutral-5 border-b-[0.75px] pb-6' : ''
          }`}
        >
          <EventDetailCard
            date={date}
            event={event}
            onBack={onDeselect}
            onEdit={() => onEditEvent(event)}
            onDelete={() => removeEvent(event.id)}
            onSaveNote={(note) => updateEvent(event.id, { note })}
          />
        </div>
      ))}
    </div>
  )
}
