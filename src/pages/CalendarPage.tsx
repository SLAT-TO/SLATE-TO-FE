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
import { useCalendarStore } from '../stores/calendarStore'
import { toDateKey } from '../utils/calendarUtils'
import plusIcon from '../assets/icons/plus.svg?raw'

// "김수민님 외 1인" 형태로 "대상" 표시 문구를 만든다
function formatTarget(names: string[]): string | undefined {
  if (names.length === 0) return undefined
  if (names.length === 1) return `${names[0]}님`
  return `${names[0]}님 외 ${names.length - 1}인`
}

// 저장된 CalendarEvent를 "수정하기" 폼의 초기값으로 되돌린다
function eventToFormValues(event: CalendarEvent): EventFormValues {
  return {
    title: event.title,
    startDate: parse(event.date, 'yyyy-MM-dd', new Date()),
    endDate: null,
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
  const removeEvent = useCalendarStore((s) => s.removeEvent)
  const updateEvent = useCalendarStore((s) => s.updateEvent)

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
    return filteredEvents.filter((event) => event.date === key)
  }, [filteredEvents, selectedDate])

  // 같은 날짜를 다시 클릭하면 패널을 닫는다
  const handleDateClick = (date: Date) => {
    setSelectedDate((prev) => (prev && toDateKey(prev) === toDateKey(date) ? null : date))
  }

  // TODO: 종료일은 스키마/BE 연동 전까지 저장하지 않음
  const handleCreateEvent = (values: EventFormValues) => {
    addEvent({
      id: crypto.randomUUID(),
      date: toDateKey(values.startDate ?? selectedDate ?? new Date()),
      title: values.title.trim() || '새 일정',
      place: values.place.trim() || undefined,
      memo: values.memo.trim() || undefined,
      participantIds: values.participantIds.length > 0 ? values.participantIds : undefined,
      target: formatTarget(values.participantNames),
      projectId: values.projectId || undefined,
    })
  }

  const handleUpdateEvent = (id: string, values: EventFormValues) => {
    updateEvent(id, {
      date: toDateKey(values.startDate ?? selectedDate ?? new Date()),
      title: values.title.trim() || '새 일정',
      place: values.place.trim() || undefined,
      memo: values.memo.trim() || undefined,
      participantIds: values.participantIds.length > 0 ? values.participantIds : undefined,
      target: formatTarget(values.participantNames),
      projectId: values.projectId || undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 월 이동 헤더 + 버튼 — 페이지 전체 폭 기준으로 고정, 패널 유무와 무관하게 자리 유지 */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
            className="rounded-md px-1 py-1 hover:bg-gray-100"
          >
            &gt;
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
            className="w-50"
            onClick={() => setFormModal({ mode: 'create' })}
          >
            <span className="flex w-full items-center justify-center gap-1">
              <InlineIcon svg={plusIcon} className="text-primary size-6" />
              일정 추가
            </span>
          </Button>
        </div>
      </header>

      {/* 헤더 아래: 캘린더(가변폭) + 선택한 날짜의 일정 패널 — stretch로 패널 높이를 캘린더에 맞춘다 */}
      <div className="flex items-stretch gap-6">
        <div className="min-w-0 flex-1">
          <Calendar
            month={month}
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onEventClick={(event) => removeEvent(event.id)}
          />
        </div>

        {selectedDate && (
          <CalendarDaySchedulePanel
            date={selectedDate}
            events={selectedDateEvents}
            onDeselect={() => setSelectedDate(null)}
            onEditEvent={(event) => setFormModal({ mode: 'edit', event })}
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
