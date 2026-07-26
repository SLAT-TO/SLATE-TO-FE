import { request } from './client'
import { paths } from './paths'
import type {
  AcceptInvitationRequest,
  AcceptInvitationResult,
  BookmarkProjectRequest,
  BookmarkProjectResult,
  CreateInvitationResult,
  CreateProjectRequest,
  CreateProjectResult,
  CursorPage,
  MemberSummary,
  ProjectActivity,
  ProjectDetailResponse,
  ProjectInvitationDetailResponse,
  ProjectListResponse,
  ProjectMemberDetailResponse,
  ProjectMemberListResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from '../types/project'
import type {
  DownloadUrlResult,
  ProjectFile,
  ProjectFileListItem,
  RegisterFileRequest,
  UpdateFileRequest,
  UploadUrlRequest,
  UploadUrlResult,
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
  return request({ method: 'GET', url: paths.projects.root, params })
}

export async function createProject(body: CreateProjectRequest): Promise<CreateProjectResult> {
  return request({ method: 'POST', url: paths.projects.root, data: body })
}

export async function getProject(projectId: number): Promise<ProjectDetailResponse> {
  return request({ method: 'GET', url: paths.projects.byId(projectId) })
}

export async function updateProject(
  projectId: number,
  body: UpdateProjectRequest,
): Promise<ProjectResponse> {
  return request({ method: 'PATCH', url: paths.projects.byId(projectId), data: body })
}

export async function deleteProject(projectId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.byId(projectId) })
}

export async function updateProjectBookmark(
  projectId: number,
  body: BookmarkProjectRequest,
): Promise<BookmarkProjectResult> {
  return request({ method: 'PATCH', url: paths.projects.bookmark(projectId), data: body })
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
): Promise<CursorPage<ProjectActivity>> {
  return request({ method: 'GET', url: paths.projects.activities(projectId) })
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

export async function getProjectFile(projectId: number, fileId: number): Promise<ProjectFile> {
  return request({ method: 'GET', url: paths.projects.file(projectId, fileId) })
}

export async function getUploadUrl(
  projectId: number,
  body: UploadUrlRequest,
): Promise<UploadUrlResult> {
  return request({ method: 'POST', url: paths.projects.uploadUrl(projectId), data: body })
}

export async function createUploadUrl(
  projectId: number,
  body: UploadUrlRequest,
): Promise<UploadUrlResult> {
  return getUploadUrl(projectId, body)
}

export async function registerFile(
  projectId: number,
  body: RegisterFileRequest,
): Promise<ProjectFile> {
  return request({ method: 'POST', url: paths.projects.files(projectId), data: body })
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

export async function getDownloadUrl(
  projectId: number,
  fileId: number,
): Promise<DownloadUrlResult> {
  return request({ method: 'GET', url: paths.projects.downloadUrl(projectId, fileId) })
}

export async function getProjectNotices(
  projectId: number,
): Promise<CursorPage<ProjectNoticeListItem>> {
  return request({ method: 'GET', url: paths.projects.notices(projectId) })
}

export async function getProjectNotice(
  projectId: number,
  noticeId: number,
): Promise<ProjectNoticeListItem> {
  return request({ method: 'GET', url: paths.projects.notice(projectId, noticeId) })
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

export type { MemberSummary }
