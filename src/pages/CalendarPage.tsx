import { useEffect, useMemo, useState } from 'react'
import { addMonths, format, parse, subMonths } from 'date-fns'
import { getProjects } from '../api/projects'
import { Button } from '../components/Button'
import { Calendar } from '../components/Calendar'
import InlineIcon from '../components/InlineIcon'
import type { CalendarEvent } from '../schemas/calendarEvent'
import type { ProjectSummary } from '../types/project'
import { CalendarFilterMenu } from '../domains/calendar/CalendarFilterMenu'
import { CalendarDaySchedulePanel } from '../domains/calendar/CalendarDaySchedulePanel'
import { EventFormModal, type EventFormValues } from '../domains/calendar/EventFormModal'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons/ChevronIcons'
import { useCalendarStore } from '../stores/calendarStore'
import { toDateKey } from '../utils/calendarUtils'
import { formatTarget } from '../utils/scheduleAdapter'
import plusIcon from '../assets/icons/plus.svg?raw'

// index.css 팔레트의 event-1~10 (CSS 변수 참조라 팔레트 값이 바뀌어도 자동으로 따라감)
const EVENT_COLORS = Array.from({ length: 10 }, (_, i) => `var(--color-event-${i + 1})`)

function randomEventColor() {
  return EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
}

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

type FormModalState = { mode: 'create' } | { mode: 'edit'; event: CalendarEvent } | null

// 캘린더 화면(페이지). 데이터 소유 + 컴포넌트 콜백 처리 담당.
export default function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const events = useCalendarStore((s) => s.events)
  const addEvent = useCalendarStore((s) => s.addEvent)
  const updateEvent = useCalendarStore((s) => s.updateEvent)
  const removeEvent = useCalendarStore((s) => s.removeEvent)

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

  // "일정 필터"에서 프로젝트를 고르면 그 프로젝트의 일정만 남긴다
  const filteredEvents = useMemo(() => {
    if (!projectFilter) return events
    return events.filter((event) => event.projectId === projectFilter)
  }, [events, projectFilter])

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const key = toDateKey(selectedDate)
    return filteredEvents.filter((event) => event.startDate <= key && event.endDate >= key)
  }, [filteredEvents, selectedDate])

  // 같은 날짜를 다시 클릭하면 패널을 닫는다
  const handleDateClick = (date: Date) => {
    setSelectedDate((prev) => (prev && toDateKey(prev) === toDateKey(date) ? null : date))
  }

  const handleCreateEvent = (values: EventFormValues) => {
    const startDate = toDateKey(values.startDate ?? selectedDate ?? new Date())
    addEvent({
      id: crypto.randomUUID(),
      startDate,
      endDate: values.endDate ? toDateKey(values.endDate) : startDate,
      title: values.title.trim() || '새 일정',
      color: randomEventColor(),
      place: values.place.trim() || undefined,
      memo: values.memo.trim() || undefined,
      participantIds: values.participantIds.length > 0 ? values.participantIds : undefined,
      target: formatTarget(values.participantNames),
      projectId: values.projectId || undefined,
    })
  }

  const handleUpdateEvent = (id: string, values: EventFormValues) => {
    const startDate = toDateKey(values.startDate ?? selectedDate ?? new Date())
    updateEvent(id, {
      startDate,
      endDate: values.endDate ? toDateKey(values.endDate) : startDate,
      title: values.title.trim() || '새 일정',
      place: values.place.trim() || undefined,
      memo: values.memo.trim() || undefined,
      participantIds: values.participantIds.length > 0 ? values.participantIds : undefined,
      target: formatTarget(values.participantNames),
      projectId: values.projectId || undefined,
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
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
          <h2 className="text-neutral-11 text-base font-bold">{format(month, 'yyyy년 M월')}</h2>
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
            variant="secondary"
            size="sm"
            width={200}
            onClick={() => setFormModal({ mode: 'create' })}
          >
            <span className="flex w-full items-center justify-center gap-2">
              <InlineIcon svg={plusIcon} className="text-primary size-6" />
              일정 추가
            </span>
          </Button>
        </div>
      </header>

      {/* 헤더 아래: 캘린더(가변폭·가변높이) + 선택한 날짜의 일정 패널 — stretch로 패널 높이를 캘린더에 맞춘다 */}
      <div className="flex min-h-0 flex-1 items-stretch gap-6">
        <div className="h-full min-w-0 flex-1">
          <Calendar
            month={month}
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        </div>

        {selectedDate && (
          <CalendarDaySchedulePanel
            date={selectedDate}
            events={selectedDateEvents}
            onDeselect={() => setSelectedDate(null)}
            onEditEvent={(event) => setFormModal({ mode: 'edit', event })}
            onDeleteEvent={(event) => removeEvent(event.id)}
            onSaveNote={(event, note) => updateEvent(event.id, { note })}
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
