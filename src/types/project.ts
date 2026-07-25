export type ProjectStatus = 'PREPARING' | 'EDITING' | 'REVIEWING' | 'COMPLETED' | string
export type ProjectLengthType = 'LONG_FORM' | 'SHORT_FORM' | string
export type ProjectPermission = 'ADMIN' | 'MEMBER' | string
export type ProjectKind = 'PERSONAL' | 'EXTERNAL' | string

export type Project = {
  id: number
  title: string
  description: string | null
  type: string
  customTypeName: string | null
  lengthType: ProjectLengthType | null
  clientName: string | null
  status: ProjectStatus
  endDate: string | null
  createdAt: string
  updatedAt: string
}

/** BE ProjectCreateRequest 기준 */
export type CreateProjectRequest = {
  title: string
  description: string
  type: string
  customTypeName?: string
  lengthType: ProjectLengthType
  clientName?: string
  endDate: string
  kind?: ProjectKind
  roleNames: string[]
}

export type CreateProjectResult = {
  id: number
  title: string
  status: ProjectStatus
  createdAt: string
  updatedAt?: string
}

export type UpdateProjectRequest = Partial<Omit<CreateProjectRequest, 'roleNames'>> & {
  status?: ProjectStatus
}

export type ProjectMember = {
  id: number
  userId: number
  name: string
  profileImageUrl: string | null
  email: string
  region: string | null
  /** 표시용 — roleNames[0] */
  jobRole: string
  roleNames: string[]
  isAdmin: boolean
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | string

export type ProjectInvitation = {
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

export type CreateInvitationResult = {
  inviteUrl: string
  expiresAt: string
}

export type AcceptInvitationRequest = {
  roleNames: string[]
}

export type AcceptInvitationResult = {
  projectId: number
  memberId: number
  roleNames: string[]
  joinedAt: string
}
