import { request } from './client'
import { paths } from './paths'
import type {
  AppliedRecruitment,
  Application,
  ApplicationResult,
  CreateApplicationRequest,
  CreateRecruitmentRequest,
  Recruitment,
  RecruitmentBookmarkResult,
  RecruitmentDetailResponse,
  UpdateApplicationRequest,
  UpdateRecruitmentRequest,
} from '../types/recruitment'
import type { CursorPage } from '../types/project'

export type RecruitmentListParams = {
  keyword?: string
  category?: string[]
  lengthType?: string // ← 배열 아님, 단수
  recruitPart?: string[]
  location?: string[]
  status?: string
  sort?: string
  cursor?: number
  size?: number
}

export async function getRecruitments(
  params: RecruitmentListParams = {},
): Promise<CursorPage<Recruitment>> {
  return request({ method: 'GET', url: paths.recruitments.root, params })
}

export async function getRecommendedRecruitments(): Promise<CursorPage<Recruitment>> {
  return request({ method: 'GET', url: paths.recruitments.recommended })
}

export async function getRecruitment(recruitmentId: number): Promise<RecruitmentDetailResponse> {
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

export async function getMyApplications(): Promise<CursorPage<AppliedRecruitment>> {
  return request({ method: 'GET', url: paths.users.myApplications })
}

export async function getMyRecruitments(): Promise<CursorPage<Recruitment>> {
  return request({ method: 'GET', url: paths.users.myRecruitments })
}

export async function getMyRecruitmentBookmarks(): Promise<CursorPage<Recruitment>> {
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
  body: CreateApplicationRequest,
): Promise<ApplicationResult> {
  return request({
    method: 'POST',
    url: paths.recruitments.applications(recruitmentId),
    data: body,
  })
}

export async function getApplications(recruitmentId: number): Promise<{ items: Application[] }> {
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
