import type { UserCategory } from './user'

export type ProjectStatus = 'PREPARING' | 'SHOOTING' | 'EDITING' | 'COMPLETED' | string
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
  pinnedAt?: string | null
  previewImageUrl?: string | null
  memberPreviewImageUrls: string[]
  memberCount: number
  /** FE 확장 — 상세 응답(roleNames/myPermission)과 동일 패턴, 목록 API에 아직 없으면 BE 정합 필요 */
  roleNames: string[]
  myPermission: ProjectPermission
  canEdit: boolean
  canDelete: boolean
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

/** BE ActivityLogItem.type */
export type ProjectActivityType =
  | 'PROJECT_MEMBER_JOINED'
  | 'PROJECT_STATUS_CHANGED'
  | 'PROJECT_UPDATED'
  | 'SCHEDULE_CREATED'
  | 'SCHEDULE_UPDATED'
  | 'NOTICE_CREATED'
  | 'FILE_UPLOADED'
  | 'VIDEO_FEEDBACK_COMMENTED'
  | string

/** BE ActivityLogItem */
export type ProjectActivity = {
  activityId: number
  type: ProjectActivityType
  content: string
  targetType: string | null
  targetId: number | null
  createdAt: string
  /** 미확인이면 true (홈 알림 isRead와 반대 의미) */
  isNew: boolean
}

/** BE ActivityLogListResponse — nextCursor는 string */
export type ActivityLogListResult = {
  items: ProjectActivity[]
  nextCursor: string | null
  hasNext: boolean
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
