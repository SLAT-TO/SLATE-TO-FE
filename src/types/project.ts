export type ProjectStatus = 'PREPARING' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD' | string
export type ProjectLengthType = 'LONG_FORM' | 'SHORT_FORM' | string
export type ProjectPermission = 'ADMIN' | 'MEMBER' | string

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

export type CreateProjectRequest = {
  title: string
  description: string
  type: string
  customTypeName?: string
  lengthType: ProjectLengthType
  clientName?: string
  endDate: string
  jobRole: string
  customJobRole?: string
}

export type CreateProjectResult = {
  id: number
  title: string
  status: ProjectStatus
  permission: ProjectPermission
  startDate: string
  createdAt: string
}

export type UpdateProjectRequest = Partial<
  Omit<CreateProjectRequest, 'jobRole' | 'customJobRole'>
> & {
  status?: ProjectStatus
}

export type ProjectMember = {
  id: number
  userId: number
  name: string
  profileImageUrl: string | null
  email: string
  region: string | null
  jobRole: string
  isAdmin: boolean
}

export type ProjectInvitation = {
  projectId: number
  projectTitle: string
  inviterName: string
  status: ProjectStatus
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
