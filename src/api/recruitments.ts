import { request } from './client'
import { paths } from './paths'
import type {
  AppliedRecruitment,
  Application,
  ApplicationResult,
  ApplicationStatusValue,
  CreateApplicationRequest,
  CreateRecruitmentRequest,
  Recruitment,
  RecruitmentBookmarkResult,
  RecruitmentDetailResponse,
  UpdateApplicationRequest,
  UpdateRecruitmentRequest,
  RecruitmentApplication,
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

/** 목록 화면에 더보기 UI가 없어 hasNext가 끝날 때까지 전량 조회 */
export async function getAllRecruitments(
  params: Omit<RecruitmentListParams, 'cursor'> = {},
): Promise<Recruitment[]> {
  const items: Recruitment[] = []
  let cursor: number | undefined
  // 서버가 hasNext만 true로 주고 커서를 누락해도 멈추도록 반복 횟수에 상한을 둠
  for (let i = 0; i < 20; i += 1) {
    const page = await getRecruitments({ ...params, cursor })
    items.push(...page.items)
    if (!page.hasNext || page.nextCursor == null) break
    cursor = page.nextCursor
  }
  return items
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

export type ApplicationListParams = {
  status?: ApplicationStatusValue
  cursor?: number
  size?: number
}

export async function getApplications(
  recruitmentId: number,
  params: ApplicationListParams = {},
): Promise<CursorPage<RecruitmentApplication>> {
  return request({
    method: 'GET',
    url: paths.recruitments.applications(recruitmentId),
    params,
  })
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

/** 지원자 전량 조회 — 디자인상 페이지네이션 UI가 없어 hasNext가 끝날 때까지 이어 받음 */
export async function getAllApplications(
  recruitmentId: number,
  params: Omit<ApplicationListParams, 'cursor'> = {},
): Promise<RecruitmentApplication[]> {
  const items: RecruitmentApplication[] = []
  let cursor: number | undefined

  // 서버가 hasNext만 true로 주고 커서를 누락해도 멈추도록 반복 횟수에 상한을 둠
  for (let i = 0; i < 20; i += 1) {
    const page = await getApplications(recruitmentId, { ...params, cursor })
    items.push(...page.items)
    if (!page.hasNext || page.nextCursor == null) break
    cursor = page.nextCursor
  }

  return items
}
