export type ProjectStatus = 'PREPARING' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD' | string
export type ProjectLengthType = 'FEATURE' | 'SHORT' | 'DOCUMENTARY' | string

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
  description?: string
  type: string
  customTypeName?: string
  lengthType?: ProjectLengthType
  clientName?: string
  endDate?: string
}

export type UpdateProjectRequest = Partial<CreateProjectRequest> & {
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

export type ProjectActivity = {
  id: number
  projectId: number
  type: string
  message: string
  createdAt: string
  actorName: string | null
}
