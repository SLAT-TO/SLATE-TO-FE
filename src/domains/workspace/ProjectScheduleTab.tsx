import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addMonths, format, parse, subMonths } from 'date-fns'
import {
  createWorkspaceSchedule,
  deleteWorkspaceSchedule,
  getWorkspaceDailySchedules,
  getWorkspaceProjectSchedules,
  updateWorkspacePrivateMemo,
  updateWorkspaceSchedule,
} from './workspaceSchedules'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import { Calendar } from '../../components/Calendar'
import ConfirmModal from '../../components/ConfirmModal'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons/ChevronIcons'
import InlineIcon from '../../components/InlineIcon'
import { EventFormModal, type EventFormValues } from '../calendar/EventFormModal'
import type { CalendarEvent } from '../../schemas/calendarEvent'
import type { MemberSummary } from '../../types/project'
import type { Schedule } from '../../types/schedule'
import { pickEventColor, toDateKey } from '../../utils/calendarUtils'
import { formatTarget, scheduleToCalendarEvent } from '../../utils/scheduleAdapter'
import { invalidateProjectActivityData } from '../../queries/projectInvalidation'
import paperPlaneIcon from '../../assets/icons/paper-plane.svg?raw'

type ProjectScheduleTabProps = {
  projectId: number
  members: MemberSummary[]
}

type FormModalState = { mode: 'create' } | { mode: 'edit'; schedule: Schedule } | null

// 일정 폼 값을 실제 Schedule API의 시작/종료 일시로 변환 (폼엔 시간 입력이 없어 하루 종일로 취급)
function toScheduleDateTimes(values: EventFormValues, fallbackDate: Date | null) {
  const startDate = values.startDate ?? fallbackDate ?? new Date()
  const endDate = values.endDate ?? startDate
  return {
    startAt: `${toDateKey(startDate)}T00:00:00`,
    endAt: `${toDateKey(endDate)}T23:59:59`,
  }
}

function scheduleToFormValues(schedule: Schedule): EventFormValues {
  return {
    title: schedule.title,
    startDate: parse(schedule.startAt.slice(0, 10), 'yyyy-MM-dd', new Date()),
    endDate: parse(schedule.endAt.slice(0, 10), 'yyyy-MM-dd', new Date()),
    projectId: schedule.projectId != null ? String(schedule.projectId) : '',
    participantIds: schedule.participantIds.map(String),
    participantNames: [],
    place: schedule.location ?? '',
    memo: schedule.publicMemo ?? '',
  }
}

interface ScheduleDetailCardProps {
  schedule: Schedule
  members: MemberSummary[]
  onEdit: () => void
  onDelete: () => void
  onSaveNote: (note: string) => Promise<void>
}

// "일정 상세" 아래 카드 한 쌍(정보 + 나에게만 보이는 메모) — 워크스페이스 일정 탭 전용 레이아웃
function ScheduleDetailCard({
  schedule,
  members,
  onEdit,
  onDelete,
  onSaveNote,
}: ScheduleDetailCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [note, setNote] = useState(schedule.privateMemo ?? '')
  const [noteSaved, setNoteSaved] = useState(false)
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState('')

  const participantNames = schedule.participantIds
    .map((id) => members.find((m) => m.userId === id)?.nickname)
    .filter((name): name is string => !!name)

  const handleSendNote = async () => {
    if (note.trim() === (schedule.privateMemo ?? '')) return
    setNoteSaving(true)
    setNoteError('')
    try {
      await onSaveNote(note.trim())
      setNoteSaved(true)
      window.setTimeout(() => setNoteSaved(false), 2000)
    } catch {
      setNoteError('메모를 저장하지 못했습니다. 다시 시도해주세요.')
    } finally {
      setNoteSaving(false)
    }
  }

  return (
    <>
      <div className="border-border-input flex items-start gap-4 rounded-[10.242px] border bg-white p-4 shadow-[0_3.414px_12.461px_rgba(169,204,244,0.15)]">
        <div
          className="h-12 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: pickEventColor(String(schedule.id)) }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-neutral-10 font-semibold tracking-[-0.32px]">
              {schedule.title}
            </p>
            <div className="text-caption-sm text-neutral-6 flex flex-wrap items-center gap-4 tracking-[-0.24px]">
              {schedule.location && <span>{schedule.location}</span>}
              {formatTarget(participantNames) && <span>{formatTarget(participantNames)}</span>}
            </div>
          </div>
          {schedule.publicMemo && (
            <p className="text-caption-sm text-neutral-10 tracking-[-0.24px]">
              {schedule.publicMemo}
            </p>
          )}
        </div>
        {schedule.canEdit === true && (
          <ActionMenu
            ariaLabel="일정 관리"
            items={[
              { action: 'edit', onClick: onEdit },
              { action: 'delete', onClick: () => setConfirmOpen(true) },
            ]}
          />
        )}
      </div>

      <div className="border-border-input flex h-full flex-col justify-between gap-2 rounded-[10.242px] border bg-white p-4 shadow-[0_3.414px_12.461px_rgba(169,204,244,0.15)]">
        <span
          className={`text-caption-sm text-neutral-5 font-semibold tracking-[-0.24px] ${
            note.trim() ? 'hidden' : ''
          }`}
        >
          참고 (나에게만 보여요)
        </span>
        <div className="flex items-end justify-between gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="클릭하여 메모 추가하기"
            rows={2}
            className="text-caption-sm text-neutral-5 placeholder:text-neutral-5 min-w-0 flex-1 resize-none bg-transparent tracking-[-0.24px] outline-none"
          />
          <button
            type="button"
            onClick={() => void handleSendNote()}
            aria-label="메모 저장"
            disabled={noteSaving}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2378FE] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <InlineIcon svg={paperPlaneIcon} className="text-neutral-1 size-4" />
          </button>
        </div>
        {noteSaved && (
          <p className="text-caption-sm text-success" role="status" aria-live="polite">
            저장되었습니다.
          </p>
        )}
        {noteError && (
          <p className="text-caption-sm text-warning" role="alert">
            {noteError}
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete()
        }}
        title="일정을 삭제할까요?"
        description={schedule.title}
        confirmText="삭제하기"
      />
    </>
  )
}

// 워크스페이스 프로젝트 상세의 "일정" 탭. 캘린더 공용 컴포넌트를 그대로 쓰되,
// 이 프로젝트의 실제 Schedule API에 연동한다 (독립 캘린더 페이지는 아직 로컬 store만 사용).
export function ProjectScheduleTab({ projectId, members }: ProjectScheduleTabProps) {
  const queryClient = useQueryClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [daySchedules, setDaySchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const refreshSelectedDaySchedules = useCallback(async () => {
    if (!selectedDate) return
    try {
      const result = await getWorkspaceDailySchedules(toDateKey(selectedDate), {
        projectId,
        scope: 'PROJECT',
      })
      setDaySchedules(result.items)
    } catch {
      setActionError('일정 상세 정보를 새로고침하지 못했습니다. 다시 시도해주세요.')
    }
  }, [projectId, selectedDate])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getWorkspaceProjectSchedules(projectId, month)
        if (!cancelled) setSchedules(result.items)
      } catch {
        if (!cancelled) setSchedules([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId, month])

  useEffect(() => {
    if (!selectedDate) return

    let cancelled = false
    const date = selectedDate

    async function loadDay() {
      try {
        const result = await getWorkspaceDailySchedules(toDateKey(date), {
          projectId,
          scope: 'PROJECT',
        })
        if (!cancelled) {
          setDaySchedules(result.items)
          setActionError(null)
        }
      } catch {
        // 월간 캘린더 항목은 참여자/메모가 없어 편집 fallback으로 쓰면 유실됨 → 에러만 표시
        if (!cancelled) {
          setDaySchedules([])
          setActionError('하루 일정을 불러오지 못했습니다. 다시 시도해주세요.')
        }
      }
    }

    void loadDay()
    return () => {
      cancelled = true
    }
  }, [projectId, selectedDate])

  const events = useMemo(
    () => schedules.map((schedule) => scheduleToCalendarEvent(schedule, members)),
    [schedules, members],
  )

  const selectedDateSchedules = selectedDate ? daySchedules : []

  const handleDateClick = (date: Date) => {
    setSelectedDate((prev) => (prev && toDateKey(prev) === toDateKey(date) ? null : date))
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(parse(event.startDate, 'yyyy-MM-dd', new Date()))
  }

  const handleCreate = async (values: EventFormValues) => {
    setActionError(null)
    try {
      const { startAt, endAt } = toScheduleDateTimes(values, selectedDate)
      const created = await createWorkspaceSchedule({
        scheduleScope: 'PROJECT',
        projectId,
        title: values.title.trim() || '새 일정',
        startAt,
        endAt,
        location: values.place.trim() || undefined,
        publicMemo: values.memo.trim() || undefined,
        participantIds: values.participantIds.map(Number),
      })
      setSchedules((prev) => [created, ...prev])
      void refreshSelectedDaySchedules()
      void invalidateProjectActivityData(queryClient, projectId)
    } catch {
      setActionError('일정을 추가하지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleUpdate = async (scheduleId: number, values: EventFormValues) => {
    setActionError(null)
    try {
      const { startAt, endAt } = toScheduleDateTimes(values, selectedDate)
      const current =
        daySchedules.find((s) => s.id === scheduleId) ?? schedules.find((s) => s.id === scheduleId)
      const updated = await updateWorkspaceSchedule(
        scheduleId,
        {
          title: values.title.trim() || '새 일정',
          startAt,
          endAt,
          location: values.place.trim() || undefined,
          publicMemo: values.memo.trim() || undefined,
          participantIds: values.participantIds.map(Number),
        },
        current,
      )
      setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      void refreshSelectedDaySchedules()
      void invalidateProjectActivityData(queryClient, projectId)
    } catch {
      setActionError('일정을 수정하지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleDelete = async (scheduleId: number) => {
    setActionError(null)
    try {
      await deleteWorkspaceSchedule(scheduleId)
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
      setDaySchedules((prev) => prev.filter((s) => s.id !== scheduleId))
      void invalidateProjectActivityData(queryClient, projectId)
    } catch {
      setActionError('일정을 삭제하지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleSaveNote = async (scheduleId: number, note: string) => {
    setActionError(null)
    const current =
      daySchedules.find((s) => s.id === scheduleId) ?? schedules.find((s) => s.id === scheduleId)
    try {
      const updated = await updateWorkspacePrivateMemo(scheduleId, { content: note }, current)
      setDaySchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setSchedules((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
    } catch {
      setActionError('메모를 저장하지 못했습니다. 다시 시도해주세요.')
      throw new Error('메모 저장에 실패했습니다.')
    }
  }

  const editingSchedule = formModal?.mode === 'edit' ? formModal.schedule : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMonth(subMonths(month, 1))}
            aria-label="이전 달"
            className="bg-main-2 text-main-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <h2 className="text-head-sm text-neutral-11 font-semibold">
            {format(month, 'yyyy년 M월')}
          </h2>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            aria-label="다음 달"
            className="bg-main-2 text-main-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>

        <Button variant="secondary" size="sm" onClick={() => setFormModal({ mode: 'create' })}>
          일정 추가
        </Button>
      </div>

      {actionError && <p className="text-caption-lg text-warning">{actionError}</p>}

      {loading ? (
        <p className="text-body-sm text-neutral-6">불러오는 중…</p>
      ) : (
        <div className="h-[520px] sm:h-[620px] lg:h-[720px]">
          <Calendar
            month={month}
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>
      )}

      {selectedDate && (
        <div className="flex flex-col gap-4">
          <h2 className="text-head-sm text-neutral-11 font-semibold">일정 상세</h2>
          {selectedDateSchedules.length === 0 ? (
            <p className="text-caption-lg text-neutral-6">등록된 일정이 없습니다</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedDateSchedules.map((schedule) => (
                <ScheduleDetailCard
                  key={schedule.id}
                  schedule={schedule}
                  members={members}
                  onEdit={() => setFormModal({ mode: 'edit', schedule })}
                  onDelete={() => handleDelete(schedule.id)}
                  onSaveNote={(note) => handleSaveNote(schedule.id, note)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {formModal && (
        <EventFormModal
          isOpen
          onClose={() => setFormModal(null)}
          onSubmit={(values) =>
            editingSchedule ? handleUpdate(editingSchedule.id, values) : handleCreate(values)
          }
          initialDate={selectedDate}
          lockedProjectId={String(projectId)}
          initialValues={editingSchedule ? scheduleToFormValues(editingSchedule) : undefined}
        />
      )}
    </div>
  )
}
