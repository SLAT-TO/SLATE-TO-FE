import { useEffect, useRef, useState } from 'react'
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
  onSaveNote: (note: string) => Promise<boolean>
}

const LABEL_CLASS = 'text-caption-sm text-neutral-10 font-semibold tracking-[-0.24px]'
const VALUE_CLASS = 'text-caption-sm text-neutral-10 font-normal tracking-[-0.24px]'

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
  const [noteFocused, setNoteFocused] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const handleSendNote = async () => {
    if (note.trim() === (event.note ?? '')) return
    setSaving(true)
    setSaveError(null)
    const succeeded = await onSaveNote(note.trim())
    setSaving(false)

    if (!succeeded) {
      setSaveError('저장하지 못했습니다. 다시 시도해주세요.')
      return
    }
    setShowSaved(true)
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500)
  }

  return (
    <div className="flex flex-col justify-center gap-2">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="shrink-0 translate-y-0.75"
        >
          <InlineIcon svg={chevronDownIcon} className="text-neutral-10 size-6 rotate-90" />
        </button>
        <h3 className="text-body-sm text-neutral-10 flex-1 leading-none font-semibold tracking-[-0.32px]">
          {format(date, 'M월 d일')} 일정
        </h3>
        {event.canEdit === true && (
          <ActionMenu
            ariaLabel="일정 관리"
            items={[
              { action: 'edit', onClick: onEdit },
              { action: 'delete', onClick: () => setConfirmOpen(true) },
            ]}
          />
        )}
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

      <div
        className="border-neutral-5 relative flex h-27 w-full max-w-[258px] flex-col gap-2 rounded-[8.675px] border-[0.542px] p-4"
        onClick={() => noteTextareaRef.current?.focus()}
      >
        {saveError && (
          <span className="text-caption-sm text-warning absolute right-0 -bottom-5 tracking-[-0.24px]">
            {saveError}
          </span>
        )}
        {!saveError && showSaved && (
          <span className="text-caption-sm text-neutral-5 absolute right-0 -bottom-5 tracking-[-0.24px]">
            저장되었습니다.
          </span>
        )}
        {!note && !noteFocused && (
          <span className="text-caption-sm text-neutral-5 pointer-events-none font-semibold tracking-[-0.24px]">
            참고 (나에게만 보여요)
          </span>
        )}
        <textarea
          ref={noteTextareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onFocus={() => setNoteFocused(true)}
          onBlur={() => setNoteFocused(false)}
          className="text-caption-sm text-neutral-5 min-h-0 flex-1 resize-none bg-transparent pr-8 tracking-[-0.24px] outline-none"
        />
        {!note && !noteFocused && (
          <span className="text-caption-sm text-neutral-5 pointer-events-none absolute bottom-4 left-4 font-normal tracking-[-0.24px]">
            클릭하여 메모 추가하기
          </span>
        )}

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSendNote}
          disabled={saving}
          aria-label="메모 저장"
          className="absolute right-3 bottom-3 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2378FE] transition-colors hover:bg-[#1C63D1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <InlineIcon
            svg={paperPlaneIcon}
            className="text-neutral-1 translate-x-0.45 size-4 translate-y-0.5"
          />
        </button>
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
