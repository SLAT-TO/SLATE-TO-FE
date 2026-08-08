import type { CalendarEvent } from '../../schemas/calendarEvent'
import { EventDetailCard } from './EventDetailCard'

interface CalendarDaySchedulePanelProps {
  date: Date
  events: CalendarEvent[]
  /** 카드의 뒤로가기 — 목록 단계가 없으므로 날짜 선택 자체를 해제한다 */
  onDeselect: () => void
  /** "수정하기" 클릭 시 — 일정 추가 폼을 이 일정 데이터로 채워서 열도록 부모에 위임 */
  onEditEvent: (event: CalendarEvent) => void
  /** 일정 삭제 — 실제 저장소(Zustand store 혹은 API)는 부모가 소유 */
  onDeleteEvent: (event: CalendarEvent) => void
  /** "나에게만 보이는" 참고 메모 저장 — 저장 성공 여부를 돌려줘서 카드가 실패를 직접 표시할 수 있게 한다 */
  onSaveNote: (event: CalendarEvent, note: string) => Promise<boolean>
}

const PANEL_SHADOW = 'shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]'

// 날짜 클릭 시 오른쪽에 뜨는 패널. 일정이 없으면 안내 문구, 있으면 해당 날짜의 모든 일정을 카드로 바로 보여준다.
export function CalendarDaySchedulePanel({
  date,
  events,
  onDeselect,
  onEditEvent,
  onDeleteEvent,
  onSaveNote,
}: CalendarDaySchedulePanelProps) {
  if (events.length === 0) {
    return (
      <div
        className={`flex w-80 shrink-0 flex-col items-center justify-center rounded-[10.242px] bg-white py-10 ${PANEL_SHADOW}`}
      >
        <p className="text-caption-sm text-neutral-5 font-normal tracking-[-0.24px] capitalize">
          등록된 일정이 없습니다
        </p>
      </div>
    )
  }

  return (
    <div
      className={`flex max-h-full w-80 shrink-0 flex-col gap-5 overflow-auto rounded-[10.242px] bg-white p-6 ${PANEL_SHADOW}`}
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
            onDelete={() => onDeleteEvent(event)}
            onSaveNote={(note) => onSaveNote(event, note)}
          />
        </div>
      ))}
    </div>
  )
}
