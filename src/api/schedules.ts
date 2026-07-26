import { request } from './client'
import { paths } from './paths'
import type {
  CreateScheduleRequest,
  PrivateMemoRequest,
  Schedule,
  ScheduleParticipantCandidate,
  ScheduleSummaryItem,
  TodayBriefing,
  UpdateScheduleRequest,
} from '../types/schedule'

export async function getTodayBriefing(): Promise<TodayBriefing> {
  return request({ method: 'GET', url: paths.briefings.today })
}

export async function getScheduleSummary(): Promise<{ items: ScheduleSummaryItem[] }> {
  return request({ method: 'GET', url: paths.schedules.summary })
}

export async function getSchedules(projectId?: number): Promise<{ items: Schedule[] }> {
  return request({
    method: 'GET',
    url: paths.schedules.root,
    params: projectId != null ? { projectId } : undefined,
  })
}

export async function getProjectSchedules(projectId: number): Promise<{ items: Schedule[] }> {
  return request({ method: 'GET', url: paths.projects.schedules(projectId) })
}

export async function getDailySchedules(date: string): Promise<{ items: Schedule[] }> {
  return request({ method: 'GET', url: paths.schedules.daily, params: { date } })
}

export async function createSchedule(body: CreateScheduleRequest): Promise<Schedule> {
  return request({ method: 'POST', url: paths.schedules.root, data: body })
}

export async function updateSchedule(
  scheduleId: number,
  body: UpdateScheduleRequest,
): Promise<Schedule> {
  return request({ method: 'PATCH', url: paths.schedules.byId(scheduleId), data: body })
}

export async function deleteSchedule(scheduleId: number): Promise<{ deletedAt: string }> {
  return request({ method: 'DELETE', url: paths.schedules.byId(scheduleId) })
}

export async function getScheduleCandidates(
  projectId: number,
): Promise<{ items: ScheduleParticipantCandidate[] }> {
  return request({ method: 'GET', url: paths.projects.scheduleCandidates(projectId) })
}

export async function updatePrivateMemo(
  scheduleId: number,
  body: PrivateMemoRequest,
): Promise<Schedule> {
  return request({ method: 'PATCH', url: paths.schedules.privateMemo(scheduleId), data: body })
}
