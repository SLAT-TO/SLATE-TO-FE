import { request } from './client'
import { paths } from './paths'
import type {
  Application,
  CreateApplicationRequest,
  CreateRecruitmentRequest,
  Recruitment,
  RecruitmentBookmarkResult,
  UpdateApplicationRequest,
  UpdateRecruitmentRequest,
} from '../types/recruitment'

export async function getRecruitments(): Promise<{ content: Recruitment[] }> {
  return request({ method: 'GET', url: paths.recruitments.root })
}

export async function getRecommendedRecruitments(): Promise<{ content: Recruitment[] }> {
  return request({ method: 'GET', url: paths.recruitments.recommended })
}

export async function getRecruitment(recruitmentId: number): Promise<Recruitment> {
  return request({ method: 'GET', url: paths.recruitments.byId(recruitmentId) })
}

export async function createRecruitment(body: CreateRecruitmentRequest): Promise<Recruitment> {
  return request({ method: 'POST', url: paths.recruitments.root, data: body })
}

export async function updateRecruitment(
  recruitmentId: number,
  body: UpdateRecruitmentRequest,
): Promise<Recruitment> {
  return request({ method: 'PATCH', url: paths.recruitments.byId(recruitmentId), data: body })
}

export async function deleteRecruitment(recruitmentId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.recruitments.byId(recruitmentId) })
}

export async function getMyRecruitments(): Promise<{ content: Recruitment[] }> {
  return request({ method: 'GET', url: paths.users.myRecruitments })
}

export async function getMyApplications(): Promise<{ content: Application[] }> {
  return request({ method: 'GET', url: paths.users.myApplications })
}

export async function getMyRecruitmentBookmarks(): Promise<{ content: Recruitment[] }> {
  return request({ method: 'GET', url: paths.users.myRecruitmentBookmarks })
}

export async function bookmarkRecruitment(
  recruitmentId: number,
): Promise<RecruitmentBookmarkResult> {
  return request({ method: 'POST', url: paths.recruitments.bookmark(recruitmentId) })
}

export async function unbookmarkRecruitment(
  recruitmentId: number,
): Promise<RecruitmentBookmarkResult> {
  return request({ method: 'DELETE', url: paths.recruitments.bookmark(recruitmentId) })
}

export async function applyRecruitment(
  recruitmentId: number,
  body: CreateApplicationRequest = {},
): Promise<Application> {
  return request({
    method: 'POST',
    url: paths.recruitments.applications(recruitmentId),
    data: body,
  })
}

export async function getApplications(recruitmentId: number): Promise<{ content: Application[] }> {
  return request({ method: 'GET', url: paths.recruitments.applications(recruitmentId) })
}

export async function updateApplicationStatus(
  recruitmentId: number,
  applicationId: number,
  body: UpdateApplicationRequest,
): Promise<Application> {
  return request({
    method: 'PATCH',
    url: paths.recruitments.application(recruitmentId, applicationId),
    data: body,
  })
}
