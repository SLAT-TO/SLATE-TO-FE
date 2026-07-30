import type { UserCategory } from './user'

export type ProjectStatus = 'PREPARING' | 'EDITING' | 'REVIEWING' | 'COMPLETED' | string
export type ProjectLengthType = 'LONG_FORM' | 'SHORT_FORM' | string
export type ProjectPermission = 'ADMIN' | 'MEMBER' | string
export type ProjectKind = 'PERSONAL' | 'EXTERNAL' | string

/** BE ProjectListResponse.ProjectSummary */
export type ProjectSummary = {
  id: number
  title: string
  type: UserCategory | string
  lengthType: ProjectLengthType | null
  status: ProjectStatus
  kind: ProjectKind | null
  startDate: string | null
  endDate: string | null
  deadlineProgressPercent: number | null
  lastActivityAt: string | null
  isPinned: boolean
  myPermission: ProjectPermission
  memberPreviewImageUrls: string[]
  memberCount: number
  createdAt: string
  updatedAt: string
}

/** BE ProjectListResponse */
export type ProjectListResponse = {
  items: ProjectSummary[]
  nextCursor: number | null
  hasNext: boolean
}

/** BE ProjectDetailResponse.OwnerSummary */
export type ProjectOwnerSummary = {
  id: number
  nickname: string
  profileImageUrl: string | null
}

/** BE ProjectDetailResponse */
export type ProjectDetailResponse = {
  id: number
  title: string
  type: UserCategory | string
  lengthType: ProjectLengthType | null
  description: string | null
  startDate: string | null
  endDate: string | null
  clientName: string | null
  status: ProjectStatus
  kind: ProjectKind | null
  owner: ProjectOwnerSummary
  myPermission: ProjectPermission
  roleNames: string[]
  memberCount: number
  canEdit: boolean
  canDelete: boolean
  isPinned: boolean
  pinnedAt: string | null
  createdAt: string
  updatedAt: string
}

/** BE ProjectResponse (create / update) */
export type ProjectResponse = {
  id: number
  title: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

/** BE ProjectCreateRequest */
export type CreateProjectRequest = {
  title: string
  description: string
  type: UserCategory | string
  lengthType: ProjectLengthType
  clientName?: string
  endDate: string
  kind?: ProjectKind
  roleNames: string[]
}

export type CreateProjectResult = ProjectResponse

/** BE ProjectUpdateRequest */
export type UpdateProjectRequest = {
  title?: string
  type?: UserCategory | string
  lengthType?: ProjectLengthType
  description?: string
  endDate?: string
  clientName?: string
  status?: ProjectStatus
  kind?: ProjectKind
}

/** BE MemberSummary */
export type MemberSummary = {
  memberId: number
  userId: number
  nickname: string
  profileImageUrl: string | null
  permission: ProjectPermission
  roleNames: string[]
  joinedAt: string
}

/** BE ProjectMemberDetailResponse */
export type ProjectMemberDetailResponse = {
  memberId: number
  userId: number
  nickname: string
  email: string
  profileImageUrl: string | null
  bio: string | null
  permission: ProjectPermission
  roleNames: string[]
  joinedAt: string
}

/** BE ProjectMemberListResponse */
export type ProjectMemberListResponse = {
  items: MemberSummary[]
  memberCount: number
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | string

/** BE ProjectInvitationDetailResponse */
export type ProjectInvitationDetailResponse = {
  projectId: number
  projectTitle: string
  inviterName: string
  status: InvitationStatus
  expiresAt: string
}

export type ActivityActor = {
  type: 'USER' | 'CLIENT_REVIEWER' | 'SYSTEM'
  id?: number
  name?: string
}

/** FE mock 전용 — BE activities API 미구현 */
export type ProjectActivity = {
  id: number
  projectId: number
  type: string
  content: string
  actor: ActivityActor
  groupCount: number
  metadata: Record<string, unknown>
  createdAt: string
}

export type CursorPage<T> = {
  items: T[]
  nextCursor: number | null
  hasNext: boolean
}

/** BE ProjectInvitationCreateResponse */
export type CreateInvitationResult = {
  inviteUrl: string
  expiresAt: string
}

/** BE ProjectInvitationAcceptRequest */
export type AcceptInvitationRequest = {
  roleNames: string[]
}

/** BE ProjectInvitationAcceptResponse */
export type AcceptInvitationResult = {
  projectId: number
  memberId: number
  roleNames: string[]
  joinedAt: string
}

/** POST/DELETE /projects/{projectId}/pin — 요청 body 없음 */
export type PinProjectResult = {
  id: number
  isPinned: boolean
  pinnedAt: string | null
}
