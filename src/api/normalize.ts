import type { Project, ProjectMember, ProjectPermission, ProjectStatus } from '../types/project'
import type { MeProfile } from '../types/user'
import type { VideoListItem, VideoListResult } from '../types/video'

/** BE cursor page — mock이 배열을 줘도 흡수 */
export type CursorPageResult<T> = {
  items: T[]
  nextCursor: number | string | null
  hasNext: boolean
}

export type BeProjectSummary = {
  id: number
  title: string
  type?: string | null
  customTypeName?: string | null
  lengthType?: string | null
  status: ProjectStatus
  description?: string | null
  clientName?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
}

export type BeMember = {
  memberId?: number
  id?: number
  userId: number
  nickname?: string
  name?: string
  profileImageUrl: string | null
  email?: string | null
  region?: string | null
  permission?: ProjectPermission
  roleNames?: string[]
  jobRole?: string
  isAdmin?: boolean
  joinedAt?: string
}

export type BeMemberListResult = BeMember[] | { items: BeMember[]; memberCount?: number }

export type BeMe = Omit<MeProfile, 'location'> & {
  region?: string | null
  location?: string | null
}

export type BeVideoListRaw =
  | VideoListResult
  | CursorPageResult<VideoListItem>
  | { videos: VideoListItem[]; nextCursor: number | null; hasNext: boolean }

export type BeProjectListRaw = BeProjectSummary[] | CursorPageResult<BeProjectSummary>

export function toProject(raw: BeProjectSummary): Project {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? null,
    type: raw.type ?? '',
    customTypeName: raw.customTypeName ?? null,
    lengthType: (raw.lengthType as Project['lengthType']) ?? null,
    clientName: raw.clientName ?? null,
    status: raw.status,
    endDate: raw.endDate ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function normalizeProjectList(
  result: BeProjectSummary[] | CursorPageResult<BeProjectSummary>,
): Project[] {
  const items = Array.isArray(result) ? result : result.items
  return items.map(toProject)
}

export function toProjectMember(raw: BeMember): ProjectMember {
  const roleNames = raw.roleNames ?? []
  const jobRole = raw.jobRole ?? roleNames[0] ?? ''
  return {
    id: raw.memberId ?? raw.id ?? 0,
    userId: raw.userId,
    name: raw.nickname ?? raw.name ?? '',
    profileImageUrl: raw.profileImageUrl,
    email: raw.email ?? '',
    region: raw.region ?? null,
    jobRole,
    roleNames,
    isAdmin: raw.isAdmin ?? raw.permission === 'ADMIN',
  }
}

export function normalizeMemberList(result: BeMemberListResult): ProjectMember[] {
  const items = Array.isArray(result) ? result : result.items
  return items.map(toProjectMember)
}

export function normalizeVideoList(result: BeVideoListRaw): VideoListResult {
  if ('videos' in result && Array.isArray(result.videos)) {
    return {
      items: result.videos,
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    }
  }
  const page = result as CursorPageResult<VideoListItem>
  return {
    items: page.items,
    nextCursor: typeof page.nextCursor === 'string' ? Number(page.nextCursor) : page.nextCursor,
    hasNext: page.hasNext,
  }
}

/** BE GET /users/me 는 region, FE·공개프로필은 location — 둘 다 채움 */
export function normalizeMe(raw: BeMe): MeProfile {
  const location = raw.location ?? raw.region ?? null
  return {
    ...raw,
    region: raw.region ?? location,
    location,
  }
}
