import { useCallback, useEffect, useMemo, useState } from 'react'
import { addMonths, format, parse, subMonths } from 'date-fns'
import { getProjects } from '../api/projects'
import {
  createSchedule,
  deleteSchedule,
  getDailySchedules,
  getSchedules,
  updatePrivateMemo,
  updateSchedule,
} from '../api/schedules'
import { Button } from '../components/Button'
import { Calendar } from '../components/Calendar'
import { CalendarLoading } from '../components/CalendarLoading'
import InlineIcon from '../components/InlineIcon'
import type { CalendarEvent } from '../schemas/calendarEvent'
import type { ProjectSummary } from '../types/project'
import type { Schedule, ScheduleDailyItem, ScheduleScope } from '../types/schedule'
import { CalendarFilterMenu } from '../domains/calendar/CalendarFilterMenu'
import { CalendarDaySchedulePanel } from '../domains/calendar/CalendarDaySchedulePanel'
import { EventFormModal, type EventFormValues } from '../domains/calendar/EventFormModal'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons/ChevronIcons'
import { pickEventColor, toDateKey } from '../utils/calendarUtils'
import { scheduleToCalendarEvent } from '../utils/scheduleAdapter'
import plusIcon from '../assets/icons/plus.svg?raw'

// 저장된 CalendarEvent를 "수정하기" 폼의 초기값으로 되돌린다
function eventToFormValues(event: CalendarEvent): EventFormValues {
  return {
    title: event.title,
    startDate: parse(event.startDate, 'yyyy-MM-dd', new Date()),
    endDate:
      event.endDate === event.startDate ? null : parse(event.endDate, 'yyyy-MM-dd', new Date()),
    projectId: event.projectId ?? '',
    participantIds: event.participantIds ?? [],
    participantNames: [],
    place: event.place ?? '',
    memo: event.memo ?? '',
  }
}

// GET /schedules/daily 응답(대상자·메모·수정 가능 여부 포함)을 캘린더 공용 컴포넌트가 쓰는 CalendarEvent로 변환
function dailyItemToCalendarEvent(item: ScheduleDailyItem): CalendarEvent {
  return {
    id: String(item.scheduleId),
    startDate: item.startAt.slice(0, 10),
    endDate: item.endAt.slice(0, 10),
    title: item.title,
    color: pickEventColor(String(item.scheduleId)),
    place: item.location ?? undefined,
    projectId: item.projectId != null ? String(item.projectId) : undefined,
    target: item.participantSummary ?? undefined,
    participantIds: item.participants.map((p) => String(p.userId)),
    memo: item.publicMemo ?? undefined,
    note: item.privateMemo ?? undefined,
    canEdit: item.canEdit,
  }
}

type FormModalState = { mode: 'create' } | { mode: 'edit'; event: CalendarEvent } | null

// 캘린더 화면(페이지). 데이터 소유 + 컴포넌트 콜백 처리 담당.
export default function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [daySchedules, setDaySchedules] = useState<ScheduleDailyItem[]>([])
  const [actionError, setActionError] = useState<string | null>(null)

  // 일정 필터·일정 추가 폼이 공유하는 실제 프로젝트 목록
  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        const result = await getProjects()
        if (!cancelled) setProjects(result.items)
      } catch {
        if (!cancelled) setProjects([])
      }
    }

    void loadProjects()
    return () => {
      cancelled = true
    }
  }, [])

  const projectOptions = useMemo(
    () => projects.map((project) => ({ value: String(project.id), label: project.title })),
    [projects],
  )

  // 달력 그리드 — GET /schedules (기간 기준 통합 조회). scope/projectId는 "일정 필터" 선택에 따라 서버에서 걸러진다
  useEffect(() => {
    let cancelled = false

    async function loadMonth() {
      setScheduleLoading(true)
      try {
        const result = await getSchedules({
          month,
          projectId: projectFilter ? Number(projectFilter) : undefined,
        })
        if (!cancelled) setSchedules(result.items)
      } catch {
        if (!cancelled) setSchedules([])
      } finally {
        if (!cancelled) setScheduleLoading(false)
      }
    }

    void loadMonth()
    return () => {
      cancelled = true
    }
  }, [month, projectFilter])

  const monthEvents = useMemo(
    () => schedules.map((schedule) => scheduleToCalendarEvent(schedule, [])),
    [schedules],
  )

  // 일정 생성/수정/삭제/메모 저장 뒤 "선택한 날짜" 패널을 다시 불러오기 위한 공용 함수 (핸들러에서만 호출 — 이펙트 밖)
  const refreshDaySchedules = useCallback(
    async (date: Date) => {
      try {
        const result = await getDailySchedules(toDateKey(date), {
          projectId: projectFilter ? Number(projectFilter) : undefined,
          scope: projectFilter ? 'PROJECT' : 'ALL',
        })
        setDaySchedules(result.items)
      } catch {
        setDaySchedules([])
        setActionError('하루 일정을 불러오지 못했습니다. 다시 시도해주세요.')
      }
    },
    [projectFilter],
  )

  // 선택한 날짜가 바뀔 때 GET /schedules/daily (대상자/메모/수정 가능 여부 포함)로 그날 상세를 불러온다
  useEffect(() => {
    if (!selectedDate) return

    let cancelled = false
    const date = selectedDate

    async function loadDay() {
      try {
        const result = await getDailySchedules(toDateKey(date), {
          projectId: projectFilter ? Number(projectFilter) : undefined,
          scope: projectFilter ? 'PROJECT' : 'ALL',
        })
        if (!cancelled) setDaySchedules(result.items)
      } catch {
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
  }, [selectedDate, projectFilter])

  const selectedDateEvents = useMemo(
    () => daySchedules.map(dailyItemToCalendarEvent),
    [daySchedules],
  )

  // 같은 날짜를 다시 클릭하면 패널을 닫는다
  // useCallback으로 참조를 고정 — 그렇지 않으면 캘린더와 무관한 상태 변경마다 CalendarGrid의
  // React.memo가 무효화되어 전체 주간 그리드가 리렌더된다
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate((prev) => (prev && toDateKey(prev) === toDateKey(date) ? null : date))
  }, [])

  const handleCreateEvent = async (values: EventFormValues) => {
    setActionError(null)
    const startDate = toDateKey(values.startDate ?? selectedDate ?? new Date())
    const endDate = values.endDate ? toDateKey(values.endDate) : startDate
    const scheduleScope: ScheduleScope = values.projectId ? 'PROJECT' : 'PERSONAL'
    try {
      const created = await createSchedule({
        scheduleScope,
        projectId: values.projectId ? Number(values.projectId) : undefined,
        title: values.title.trim() || '새 일정',
        startAt: `${startDate}T00:00:00`,
        endAt: `${endDate}T23:59:59`,
        location: values.place.trim() || undefined,
        publicMemo: values.memo.trim() || undefined,
        participantIds: scheduleScope === 'PROJECT' ? values.participantIds.map(Number) : undefined,
      })
      setSchedules((prev) => [created, ...prev])
      if (selectedDate) void refreshDaySchedules(selectedDate)
    } catch {
      setActionError('일정을 추가하지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleDeleteEvent = async (event: CalendarEvent) => {
    setActionError(null)
    try {
      const scheduleId = Number(event.id)
      await deleteSchedule(scheduleId)
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
      if (selectedDate) void refreshDaySchedules(selectedDate)
    } catch {
      setActionError('일정을 삭제하지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleUpdateEvent = async (id: string, values: EventFormValues) => {
    setActionError(null)
    const startDate = toDateKey(values.startDate ?? selectedDate ?? new Date())
    const endDate = values.endDate ? toDateKey(values.endDate) : startDate
    try {
      const scheduleId = Number(id)
      const current = schedules.find((s) => s.id === scheduleId)
      const updated = await updateSchedule(
        scheduleId,
        {
          title: values.title.trim() || '새 일정',
          startAt: `${startDate}T00:00:00`,
          endAt: `${endDate}T23:59:59`,
          location: values.place.trim() || undefined,
          publicMemo: values.memo.trim() || undefined,
          participantIds: values.projectId ? values.participantIds.map(Number) : undefined,
        },
        current,
      )
      setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      if (selectedDate) void refreshDaySchedules(selectedDate)
    } catch {
      setActionError('일정을 수정하지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleSaveNote = async (event: CalendarEvent, note: string): Promise<boolean> => {
    setActionError(null)
    try {
      await updatePrivateMemo(Number(event.id), { content: note })
      if (selectedDate) void refreshDaySchedules(selectedDate)
      return true
    } catch {
      setActionError('메모를 저장하지 못했습니다. 다시 시도해주세요.')
      return false
    }
  }

  return (
    <div className="-mb-5 flex h-[calc(100%+5rem)] flex-col gap-4">
      {/* 월 이동 헤더 + 버튼 — 페이지 전체 폭 기준으로 고정, 패널 유무와 무관하게 자리 유지 */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMonth(subMonths(month, 1))}
            aria-label="이전 달"
            className="bg-main-2 text-main-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <h2 className="text-neutral-11 text-head-sm font-semibold">
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

        <div className="flex items-center gap-3">
          <CalendarFilterMenu
            options={projectOptions}
            value={projectFilter}
            onChange={setProjectFilter}
          />
          <Button
            variant="primary"
            size="sm"
            width={200}
            onClick={() => setFormModal({ mode: 'create' })}
          >
            <span className="flex w-full items-center justify-center gap-1">
              <InlineIcon svg={plusIcon} className="size-6 text-white" />
              일정 추가
            </span>
          </Button>
        </div>
      </header>

      {actionError && <p className="text-caption-lg text-warning">{actionError}</p>}

      {/* 헤더 아래: 캘린더(가변폭·가변높이) + 선택한 날짜의 일정 패널 — stretch로 패널 높이를 캘린더에 맞춘다 */}
      <div className="flex min-h-0 flex-1 items-stretch gap-6">
        <div className="h-full min-w-0 flex-1">
          {scheduleLoading ? (
            <CalendarLoading />
          ) : (
            <Calendar
              month={month}
              events={monthEvents}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
            />
          )}
        </div>

        {selectedDate && (
          <CalendarDaySchedulePanel
            date={selectedDate}
            events={selectedDateEvents}
            onDeselect={() => setSelectedDate(null)}
            onEditEvent={(event) => setFormModal({ mode: 'edit', event })}
            onDeleteEvent={handleDeleteEvent}
            onSaveNote={handleSaveNote}
          />
        )}
      </div>

      {formModal && (
        <EventFormModal
          isOpen
          onClose={() => setFormModal(null)}
          onSubmit={(values) =>
            formModal.mode === 'edit'
              ? handleUpdateEvent(formModal.event.id, values)
              : handleCreateEvent(values)
          }
          initialDate={selectedDate}
          projectOptions={projectOptions}
          initialValues={formModal.mode === 'edit' ? eventToFormValues(formModal.event) : undefined}
        />
      )}
    </div>
  )
}
