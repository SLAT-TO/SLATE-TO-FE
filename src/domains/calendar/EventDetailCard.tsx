import { useState } from 'react'
import { format } from 'date-fns'
import ActionMenu from '../../components/ActionMenu'
import ConfirmModal from '../../components/ConfirmModal'
import InlineIcon from '../../components/InlineIcon'
import type { CalendarEvent } from '../../schemas/calendarEvent'
import { pickEventColor } from '../../utils/calendarUtils'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import paperPlaneIcon from '../../assets/icons/paper-plane.svg?raw'
import pencilIcon from '../../assets/icons/pencil.svg?raw'

interface EventDetailCardProps {
  date: Date
  event: CalendarEvent
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onSaveNote: (note: string) => void
}

const LABEL_CLASS = 'text-caption-sm text-neutral-10 font-semibold tracking-[-0.24px] capitalize'
const VALUE_CLASS = 'text-caption-sm text-neutral-10 font-normal tracking-[-0.24px] capitalize'

// 날짜 클릭으로 뜨는 일정 패널 안에서, 특정 일정 하나를 골랐을 때 보여주는 상세 카드
export function EventDetailCard({
  date,
  event,
  onBack,
  onEdit,
  onDelete,
  onSaveNote,
}: EventDetailCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [note, setNote] = useState(event.note ?? '')

  const handleSendNote = () => {
    if (note.trim() === (event.note ?? '')) return
    onSaveNote(note.trim())
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="shrink-0 translate-y-0.75"
        >
          <InlineIcon svg={chevronDownIcon} className="text-neutral-10 size-6 rotate-90" />
        </button>
        <h3 className="text-body-sm text-neutral-10 flex-1 leading-none font-semibold tracking-[-0.32px] capitalize">
          {format(date, 'M월 d일')} 일정
        </h3>
        <ActionMenu
          ariaLabel="일정 관리"
          items={[
            { action: 'edit', onClick: onEdit },
            { action: 'delete', onClick: () => setConfirmOpen(true) },
          ]}
        />
      </header>

      <p className={LABEL_CLASS}>{event.title}</p>

      {(event.place || event.target) && (
        <div className="flex flex-col gap-3">
          {event.place && (
            <div className="flex items-center gap-4">
              <span
                className="size-2 shrink-0"
                style={{ backgroundColor: event.color ?? 'var(--color-event-1)' }}
              />
              <div className="flex items-center gap-4">
                <span className={LABEL_CLASS}>장소</span>
                <span className={VALUE_CLASS}>{event.place}</span>
              </div>
            </div>
          )}
          {event.target && (
            <div className="flex items-center gap-4">
              <span
                className="size-2 shrink-0"
                style={{ backgroundColor: pickEventColor(event.id, event.color) }}
              />
              <div className="flex items-center gap-4">
                <span className={LABEL_CLASS}>대상</span>
                <span className={VALUE_CLASS}>{event.target}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {event.memo && (
        <div className="flex items-center gap-2">
          <InlineIcon svg={pencilIcon} className="text-neutral-10 size-3 shrink-0" />
          <span className="text-caption-sm text-neutral-10 flex-1 font-semibold tracking-[-0.24px] capitalize underline">
            {event.memo}
          </span>
          <ActionMenu
            ariaLabel="메모 관리"
            items={[
              { action: 'edit', onClick: () => {}, disabled: true },
              { action: 'delete', onClick: () => setConfirmOpen(true) },
            ]}
          />
        </div>
      )}

      <div className="border-neutral-5 flex h-27 w-full max-w-[258px] flex-col gap-2 rounded-[8.675px] border-[0.542px] p-4">
        <span className="text-caption-sm text-neutral-5 font-semibold tracking-[-0.24px] capitalize">
          참고 (나에게만 보여요)
        </span>
        <div className="flex flex-1 items-end justify-between gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSendNote}
            placeholder="클릭하여 메모 추가하기"
            rows={1}
            className="text-caption-sm text-neutral-5 placeholder:text-neutral-5 min-w-0 flex-1 resize-none bg-transparent tracking-[-0.24px] capitalize outline-none"
          />
          <button
            type="button"
            onClick={handleSendNote}
            aria-label="메모 저장"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2378FE]"
          >
            <InlineIcon
              svg={paperPlaneIcon}
              className="text-neutral-1 translate-x-0.45 size-4 translate-y-0.5"
            />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete()
        }}
        title="일정을 삭제할까요?"
        description={event.title}
        confirmText="삭제하기"
      />
    </div>
  )
}
