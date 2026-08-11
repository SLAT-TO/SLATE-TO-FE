import { request, requestBlob } from './client'
import { paths } from './paths'
import { fromApiProjectStatus, toApiProjectStatus } from '../constants/projectStatus'
import type {
  AcceptInvitationRequest,
  AcceptInvitationResult,
  CreateInvitationResult,
  CreateProjectRequest,
  CreateProjectResult,
  ActivityLogListResult,
  CursorPage,
  MemberSummary,
  PinProjectResult,
  ProjectDetailResponse,
  ProjectInvitationDetailResponse,
  ProjectListResponse,
  ProjectMemberDetailResponse,
  ProjectMemberListResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from '../types/project'
import type {
  ProjectFile,
  ProjectFileListItem,
  ProjectFileUploadRequest,
  UpdateFileRequest,
} from '../types/file'
import type {
  CreateNoticeRequest,
  ProjectNoticeListItem,
  UpdateNoticeRequest,
} from '../types/notice'

export async function getProjects(params?: {
  status?: string
  cursor?: number
  size?: number
}): Promise<ProjectListResponse> {
  const result = await request<ProjectListResponse>({
    method: 'GET',
    url: paths.projects.root,
    params,
  })
  return {
    ...result,
    items: result.items.map((item) => ({ ...item, status: fromApiProjectStatus(item.status) })),
  }
}

export async function createProject(body: CreateProjectRequest): Promise<CreateProjectResult> {
  const result = await request<CreateProjectResult>({
    method: 'POST',
    url: paths.projects.root,
    data: body,
  })
  return { ...result, status: fromApiProjectStatus(result.status) }
}

export async function getProject(projectId: number): Promise<ProjectDetailResponse> {
  const result = await request<ProjectDetailResponse>({
    method: 'GET',
    url: paths.projects.byId(projectId),
  })
  return { ...result, status: fromApiProjectStatus(result.status) }
}

export async function updateProject(
  projectId: number,
  body: UpdateProjectRequest,
): Promise<ProjectResponse> {
  const apiBody = body.status ? { ...body, status: toApiProjectStatus(body.status) } : body
  const result = await request<ProjectResponse>({
    method: 'PATCH',
    url: paths.projects.byId(projectId),
    data: apiBody,
  })
  return { ...result, status: fromApiProjectStatus(result.status) }
}

export async function deleteProject(projectId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.byId(projectId) })
}

export async function pinProject(projectId: number): Promise<PinProjectResult> {
  return request({ method: 'POST', url: paths.projects.pin(projectId) })
}

export async function unpinProject(projectId: number): Promise<PinProjectResult> {
  return request({ method: 'DELETE', url: paths.projects.pin(projectId) })
}

export async function getProjectMembers(projectId: number): Promise<ProjectMemberListResponse> {
  return request({ method: 'GET', url: paths.projects.members(projectId) })
}

export async function getProjectMember(
  projectId: number,
  memberId: number,
): Promise<ProjectMemberDetailResponse> {
  return request({
    method: 'GET',
    url: paths.projects.member(projectId, memberId),
  })
}

export async function updateMemberRole(
  projectId: number,
  memberId: number,
  roleNames: string[],
): Promise<ProjectMemberDetailResponse> {
  return request({
    method: 'PATCH',
    url: paths.projects.member(projectId, memberId),
    data: { roleNames },
  })
}

export async function removeMember(projectId: number, memberId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.member(projectId, memberId) })
}

export async function leaveProject(projectId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.leave(projectId) })
}

export async function createInvitation(projectId: number): Promise<CreateInvitationResult> {
  return request({ method: 'POST', url: paths.projects.invitations(projectId) })
}

export async function getInvitation(token: string): Promise<ProjectInvitationDetailResponse> {
  return request({ method: 'GET', url: paths.projectInvitations.byToken(token) })
}

export async function acceptInvitation(
  token: string,
  body: AcceptInvitationRequest,
): Promise<AcceptInvitationResult> {
  return request({ method: 'POST', url: paths.projectInvitations.accept(token), data: body })
}

export async function getProjectActivities(
  projectId: number,
  options?: { cursor?: string; size?: number },
): Promise<ActivityLogListResult> {
  const result = await request<
    Omit<ActivityLogListResult, 'items'> & {
      items: Array<
        Omit<ActivityLogListResult['items'][number], 'isNew'> & {
          isRead?: boolean
          isNew?: boolean
        }
      >
    }
  >({
    method: 'GET',
    url: paths.projects.activities(projectId),
    params: {
      ...(options?.cursor != null ? { cursor: options.cursor } : {}),
      ...(options?.size != null ? { size: options.size } : {}),
    },
  })
  return {
    ...result,
    items: result.items.map(({ isRead, isNew, ...item }) => ({
      ...item,
      isNew: isNew ?? !isRead,
    })),
  }
}

/** BE PATCH …/activities/{activityId}/read */
export async function markActivityRead(projectId: number, activityId: number): Promise<null> {
  return request({
    method: 'PATCH',
    url: paths.projects.activityRead(projectId, activityId),
  })
}

/** BE PATCH …/activities/read-all */
export async function markAllActivitiesRead(projectId: number): Promise<null> {
  return request({
    method: 'PATCH',
    url: paths.projects.activitiesReadAll(projectId),
  })
}

export async function getProjectFiles(
  projectId: number,
  keyword?: string,
): Promise<CursorPage<ProjectFileListItem>> {
  return request({
    method: 'GET',
    url: paths.projects.files(projectId),
    params: keyword ? { keyword } : undefined,
  })
}

/** multipart/form-data 직접 업로드 — file(바이너리) + request(JSON 메타데이터) 두 파트로 전송 */
export async function uploadProjectFile(
  projectId: number,
  file: File,
  body: ProjectFileUploadRequest,
): Promise<ProjectFile> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('request', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  // apiClient 기본 Content-Type이 application/json이라, 여기서 명시적으로 undefined로
  // 지워야 axios가 FormData를 JSON으로 오인해 직렬화하지 않고 브라우저가 boundary를
  // 포함한 multipart/form-data 값을 자동으로 채우게 둔다. 헤더를 아예 생략하면 인스턴스
  // 기본값(application/json)이 그대로 남아 FormData가 빈 객체로 직렬화된다.
  return request({
    method: 'POST',
    url: paths.projects.files(projectId),
    data: formData,
    headers: { 'Content-Type': undefined },
  })
}

export async function updateFile(
  projectId: number,
  fileId: number,
  body: UpdateFileRequest,
): Promise<ProjectFile> {
  return request({ method: 'PATCH', url: paths.projects.file(projectId, fileId), data: body })
}

export async function deleteFile(
  projectId: number,
  fileId: number,
): Promise<{ deletedAt: string }> {
  return request({ method: 'DELETE', url: paths.projects.file(projectId, fileId) })
}

/** BE가 presigned URL 대신 파일 바이너리를 직접 응답 */
export async function downloadProjectFile(projectId: number, fileId: number): Promise<Blob> {
  return requestBlob({ method: 'GET', url: paths.projects.download(projectId, fileId) })
}

export async function pinProjectFile(
  projectId: number,
  fileId: number,
): Promise<{ id: number; isPinned: boolean; pinnedAt: string | null }> {
  return request({ method: 'POST', url: paths.projects.filePin(projectId, fileId) })
}

export async function unpinProjectFile(
  projectId: number,
  fileId: number,
): Promise<{ id: number; isPinned: boolean; pinnedAt: string | null }> {
  return request({ method: 'DELETE', url: paths.projects.filePin(projectId, fileId) })
}

export async function getProjectNotices(
  projectId: number,
): Promise<CursorPage<ProjectNoticeListItem>> {
  return request({ method: 'GET', url: paths.projects.notices(projectId) })
}

export async function createProjectNotice(
  projectId: number,
  body: CreateNoticeRequest,
): Promise<ProjectNoticeListItem> {
  return request({ method: 'POST', url: paths.projects.notices(projectId), data: body })
}

export async function createNotice(
  projectId: number,
  body: CreateNoticeRequest,
): Promise<ProjectNoticeListItem> {
  return createProjectNotice(projectId, body)
}

export async function updateProjectNotice(
  projectId: number,
  noticeId: number,
  body: UpdateNoticeRequest,
): Promise<ProjectNoticeListItem> {
  return request({
    method: 'PATCH',
    url: paths.projects.notice(projectId, noticeId),
    data: body,
  })
}

export async function updateNotice(
  projectId: number,
  noticeId: number,
  body: UpdateNoticeRequest,
): Promise<ProjectNoticeListItem> {
  return updateProjectNotice(projectId, noticeId, body)
}

export async function deleteProjectNotice(projectId: number, noticeId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.notice(projectId, noticeId) })
}

export async function deleteNotice(projectId: number, noticeId: number): Promise<null> {
  return deleteProjectNotice(projectId, noticeId)
}

export async function markNoticeRead(
  projectId: number,
  noticeId: number,
): Promise<{ id: number; isRead: boolean; readAt: string }> {
  return request({ method: 'PATCH', url: paths.projects.noticeRead(projectId, noticeId) })
}

export type { MemberSummary }
