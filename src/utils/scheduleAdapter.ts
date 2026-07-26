import { format } from 'date-fns'
import type { CalendarEvent } from '../schemas/calendarEvent'
import type { MemberSummary } from '../types/project'
import type { Schedule } from '../types/schedule'
import { pickEventColor } from './calendarUtils'

// "김수민님 외 1인" 형태로 "대상" 표시 문구를 만든다 — CalendarPage/ProjectScheduleTab 공용
export function formatTarget(names: string[]): string | undefined {
  if (names.length === 0) return undefined
  if (names.length === 1) return `${names[0]}님`
  return `${names[0]}님 외 ${names.length - 1}인`
}

// 실제 BE Schedule을 캘린더 공용 컴포넌트가 쓰는 CalendarEvent로 변환한다.
// Schedule에는 color가 없어 id로 고정 배정하고, participantIds는 members로 이름을 붙여 "대상" 문구를 만든다.
export function scheduleToCalendarEvent(
  schedule: Schedule,
  members: MemberSummary[],
): CalendarEvent {
  const participantNames = schedule.participantIds
    .map((id) => members.find((m) => m.memberId === id)?.nickname)
    .filter((name): name is string => !!name)

  return {
    id: String(schedule.id),
    startDate: format(new Date(schedule.startAt), 'yyyy-MM-dd'),
    endDate: format(new Date(schedule.endAt), 'yyyy-MM-dd'),
    title: schedule.title,
    color: pickEventColor(String(schedule.id)),
    place: schedule.location ?? undefined,
    projectId: schedule.projectId != null ? String(schedule.projectId) : undefined,
    target: formatTarget(participantNames),
    participantIds: schedule.participantIds.map(String),
    memo: schedule.publicMemo ?? undefined,
    note: schedule.privateMemo ?? undefined,
  }
}
