import { request } from './client'
import { paths } from './paths'
import type {
  CreateProjectRequest,
  Project,
  ProjectActivity,
  ProjectInvitation,
  ProjectMember,
  UpdateProjectRequest,
} from '../types/project'
import type {
  DownloadUrlResult,
  ProjectFile,
  RegisterFileRequest,
  UpdateFileRequest,
  UploadUrlRequest,
  UploadUrlResult,
} from '../types/file'

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>({ method: 'GET', url: paths.projects.root })
}

export async function createProject(body: CreateProjectRequest): Promise<Project> {
  return request<Project>({ method: 'POST', url: paths.projects.root, data: body })
}

export async function getProject(projectId: number): Promise<Project> {
  return request<Project>({ method: 'GET', url: paths.projects.byId(projectId) })
}

export async function updateProject(
  projectId: number,
  body: UpdateProjectRequest,
): Promise<{ id: number; updatedAt: string }> {
  return request({ method: 'PATCH', url: paths.projects.byId(projectId), data: body })
}

export async function deleteProject(projectId: number): Promise<{ deletedAt: string }> {
  return request({ method: 'DELETE', url: paths.projects.byId(projectId) })
}

export async function getProjectMembers(projectId: number): Promise<ProjectMember[]> {
  return request({ method: 'GET', url: paths.projects.members(projectId) })
}

export async function getProjectMember(
  projectId: number,
  memberId: number,
): Promise<ProjectMember> {
  return request({ method: 'GET', url: paths.projects.member(projectId, memberId) })
}

export async function updateMemberRole(
  projectId: number,
  memberId: number,
  jobRole: string,
): Promise<ProjectMember> {
  return request({
    method: 'PATCH',
    url: paths.projects.member(projectId, memberId),
    data: { jobRole },
  })
}

export async function removeMember(projectId: number, memberId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.member(projectId, memberId) })
}

export async function leaveProject(projectId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.projects.leave(projectId) })
}

export async function createInvitation(
  projectId: number,
): Promise<{ token: string; expiresAt: string }> {
  return request({ method: 'POST', url: paths.projects.invitations(projectId) })
}

export async function getInvitation(token: string): Promise<ProjectInvitation> {
  return request({ method: 'GET', url: paths.projectInvitations.byToken(token) })
}

export async function acceptInvitation(
  token: string,
): Promise<{ projectId: number; joined: boolean }> {
  return request({ method: 'POST', url: paths.projectInvitations.accept(token) })
}

export async function getProjectActivities(
  projectId: number,
): Promise<{ items: ProjectActivity[] }> {
  return request({ method: 'GET', url: paths.projects.activities(projectId) })
}

export async function getProjectFiles(projectId: number): Promise<{ items: ProjectFile[] }> {
  return request({ method: 'GET', url: paths.projects.files(projectId) })
}

export async function getUploadUrl(
  projectId: number,
  body: UploadUrlRequest,
): Promise<UploadUrlResult> {
  return request({ method: 'POST', url: paths.projects.uploadUrl(projectId), data: body })
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
