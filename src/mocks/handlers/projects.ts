import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type {
  CreateProjectRequest,
  ProjectActivity,
  ProjectActivityType,
  UpdateProjectRequest,
} from '../../types/project'
import type { CreateNoticeRequest, UpdateNoticeRequest } from '../../types/notice'
import {
  allocId,
  db,
  getCurrentUser,
  requireUser,
  type MockMemberRecord,
  type MockProjectRecord,
} from '../db'
import { paginateByCursor } from '../pagination'
import { badRequest, domainError, notFound, unauthorized } from '../errors'
import { created, ok } from '../response'

/** Free 플랜 프로젝트 상한 — 시드 2개 기준으로 생성 여유를 둠 */
const FREE_PROJECT_LIMIT = 5

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

function toNoticeListItem(notice: (typeof db.notices)[number]) {
  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    writer: { id: notice.writerId, nickname: notice.writerNickname },
    isRead: notice.isRead,
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt,
  }
}

function toFileListItem(file: (typeof db.files)[number]) {
  const uploader = db.users.find((u) => u.id === file.uploaderId)
  return {
    id: file.id,
    fileName: file.fileName,
    description: file.description,
    contentType: file.contentType,
    fileSize: file.fileSize,
    isPinned: file.isPinned,
    isFinal: file.isFinal,
    uploader: {
      id: file.uploaderId,
      nickname: uploader?.nickname ?? '알 수 없음',
    },
    createdAt: file.createdAt,
  }
}

function toProjectFile(file: (typeof db.files)[number]) {
  return {
    ...toFileListItem(file),
    updatedAt: file.updatedAt,
  }
}

function findProjectOwner(project: MockProjectRecord) {
  return db.users.find((u) => u.id === project.ownerUserId) ?? db.users[0]!
}

/** Swagger ActivityLogItem 모양 — 조회 시점에 파일/공지/피드백 등을 취합 */
function buildProjectActivities(projectId: number): ProjectActivity[] {
  type Draft = Omit<ProjectActivity, 'activityId' | 'isNew'> & { sourceKey: string }

  const files: Draft[] = db.files
    .filter((f) => f.projectId === projectId)
    .map((f) => ({
      sourceKey: `file-${f.id}`,
      type: 'FILE_UPLOADED' satisfies ProjectActivityType,
      content: `${f.fileName} 파일이 업로드되었습니다`,
      targetType: 'FILE',
      targetId: f.id,
      createdAt: f.createdAt,
    }))

  const notices: Draft[] = db.notices
    .filter((n) => n.projectId === projectId)
    .map((n) => ({
      sourceKey: `notice-${n.id}`,
      type: 'NOTICE_CREATED' satisfies ProjectActivityType,
      content: `${n.title} 공지가 등록되었습니다`,
      targetType: 'NOTICE',
      targetId: n.id,
      createdAt: n.createdAt,
    }))

  const feedbacks: Draft[] = db.feedbacks
    .filter((f) => db.videos.find((v) => v.videoId === f.videoId)?.projectId === projectId)
    .map((f) => ({
      sourceKey: `feedback-${f.feedbackId}`,
      type: 'VIDEO_FEEDBACK_COMMENTED' satisfies ProjectActivityType,
      content: `${f.actor.name ?? '누군가'}님이 피드백을 남겼습니다`,
      targetType: 'FEEDBACK',
      targetId: f.feedbackId,
      createdAt: f.createdAt,
    }))

  const merged = [...files, ...notices, ...feedbacks].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  return merged.map((item, index) => {
    const { sourceKey: _sourceKey, ...rest } = item
    void _sourceKey
    return {
      ...rest,
      activityId: merged.length - index,
      isNew: index < 2,
    }
  })
}

/** mock 전용 — 프로젝트별 확인 처리된 activityId */
const readActivityIdsByProject = new Map<number, Set<number>>()

function getReadActivityIds(projectId: number): Set<number> {
  let set = readActivityIdsByProject.get(projectId)
  if (!set) {
    set = new Set()
    readActivityIdsByProject.set(projectId, set)
  }
  return set
}

function toMemberSummary(member: MockMemberRecord) {
  return {
    memberId: member.memberId,
    userId: member.userId,
    nickname: member.nickname,
    profileImageUrl: member.profileImageUrl,
    permission: member.permission,
    roleNames: member.roleNames,
    joinedAt: member.joinedAt,
  }
}

function toMemberDetail(member: MockMemberRecord) {
  return {
    ...toMemberSummary(member),
    email: member.email,
    bio: member.bio,
  }
}

/** 시작일~마감일 기준 경과율 (0~100). 날짜 정보가 없으면 null */
function calcDeadlineProgress(startDate: string | null, endDate: string | null): number | null {
  if (!startDate || !endDate) return null
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  if (end <= start) return null
  const now = Date.now()
  const ratio = (now - start) / (end - start)
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
}

function toProjectSummary(project: MockProjectRecord, currentUserId: number) {
  const projectMembers = db.members.filter((m) => m.projectId === project.id)
  const memberPreviewImageUrls = projectMembers
    .map((m) => m.profileImageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 4)
  const me = projectMembers.find((m) => m.userId === currentUserId)

  return {
    id: project.id,
    title: project.title,
    type: project.type,
    lengthType: project.lengthType,
    status: project.status,
    kind: project.kind,
    startDate: project.startDate,
    endDate: project.endDate,
    deadlineProgressPercent: calcDeadlineProgress(project.startDate, project.endDate),
    lastActivityAt: project.updatedAt,
    isPinned: project.isPinned,
    memberPreviewImageUrls,
    memberCount: projectMembers.length,
    roleNames: me?.roleNames ?? [],
    myPermission: me?.permission ?? 'MEMBER',
    canEdit: me?.permission === 'ADMIN',
    canDelete: me?.permission === 'ADMIN',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

function toProjectDetail(project: MockProjectRecord, currentUserId: number) {
  const owner = findProjectOwner(project)
  const projectMembers = db.members.filter((m) => m.projectId === project.id)
  const me = projectMembers.find((m) => m.userId === currentUserId)

  return {
    id: project.id,
    title: project.title,
    type: project.type,
    lengthType: project.lengthType,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    clientName: project.clientName,
    status: project.status,
    kind: project.kind,
    owner: {
      id: owner.id,
      nickname: owner.nickname,
      profileImageUrl: owner.profileImageUrl,
    },
    myPermission: me?.permission ?? 'MEMBER',
    roleNames: me?.roleNames ?? [],
    memberCount: projectMembers.length,
    canEdit: me?.permission === 'ADMIN',
    canDelete: me?.permission === 'ADMIN',
    isPinned: project.isPinned,
    pinnedAt: project.pinnedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

function isInvitationExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now()
}

export const projectHandlers = [
  http.get(paths.projects.root, () => {
    const user = safeUser()
    if (!user) return unauthorized()
    const items = db.projects.map((project) => toProjectSummary(project, user.id))
    return HttpResponse.json(ok({ items, nextCursor: null, hasNext: false }), {
      status: 200,
    })
  }),

  http.post(paths.projects.root, async ({ request }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as CreateProjectRequest
    if (
      !body.title ||
      !body.type ||
      !body.description ||
      !body.lengthType ||
      !body.endDate ||
      !body.roleNames?.length
    ) {
      return badRequest()
    }
    if (db.projects.length >= FREE_PROJECT_LIMIT) {
      return domainError('PROJECT409', '무료 계정은 최대 5개의 프로젝트만 생성할 수 있습니다.')
    }

    const now = new Date().toISOString()
    const project: MockProjectRecord = {
      id: allocId(),
      title: body.title,
      description: body.description,
      type: body.type,
      lengthType: body.lengthType,
      clientName: body.clientName ?? null,
      status: 'PREPARING',
      kind: body.kind ?? 'PERSONAL',
      startDate: now.slice(0, 10),
      endDate: body.endDate,
      ownerUserId: user.id,
      isPinned: false,
      pinnedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    db.projects.unshift(project)

    db.members.unshift({
      memberId: allocId(),
      projectId: project.id,
      userId: user.id,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      email: user.email,
      bio: user.bio,
      permission: 'ADMIN',
      roleNames: body.roleNames,
      joinedAt: now,
    })

    return HttpResponse.json(
      created({
        id: project.id,
        title: project.title,
        status: project.status,
        createdAt: now,
        updatedAt: now,
      }),
      { status: 201 },
    )
  }),

  http.get(paths.projects.byId(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const user = requireUser()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return domainError('PROJECT404', '프로젝트를 찾을 수 없습니다.')
    return HttpResponse.json(ok(toProjectDetail(project, user.id)), { status: 200 })
  }),

  http.patch(paths.projects.byId(':projectId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return domainError('PROJECT404', '프로젝트를 찾을 수 없습니다.')
    const body = (await request.json()) as UpdateProjectRequest
    Object.assign(project, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(
      ok({
        id: project.id,
        title: project.title,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }),
      { status: 200 },
    )
  }),

  http.delete(paths.projects.byId(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.projectId)
    if (!db.projects.some((p) => p.id === id)) return notFound()
    db.projects = db.projects.filter((p) => p.id !== id)
    return HttpResponse.json(ok({ deletedAt: new Date().toISOString() }), { status: 200 })
  }),

  http.post(paths.projects.pin(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return domainError('PROJECT404', '프로젝트를 찾을 수 없습니다.')
    project.isPinned = true
    project.pinnedAt = new Date().toISOString()
    return HttpResponse.json(
      ok({ id: project.id, isPinned: project.isPinned, pinnedAt: project.pinnedAt }),
      {
        status: 200,
      },
    )
  }),

  http.delete(paths.projects.pin(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return domainError('PROJECT404', '프로젝트를 찾을 수 없습니다.')
    project.isPinned = false
    project.pinnedAt = null
    return HttpResponse.json(
      ok({ id: project.id, isPinned: project.isPinned, pinnedAt: project.pinnedAt }),
      {
        status: 200,
      },
    )
  }),

  http.get(paths.projects.members(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) {
      return domainError('PROJECT404', '프로젝트를 찾을 수 없습니다.')
    }
    const items = db.members
      .filter((m) => m.projectId === Number(params.projectId))
      .map(toMemberSummary)
    return HttpResponse.json(ok({ items, memberCount: items.length }), { status: 200 })
  }),

  http.get(paths.projects.member(':projectId', ':memberId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const member = db.members.find(
      (m) => m.memberId === Number(params.memberId) && m.projectId === Number(params.projectId),
    )
    if (!member) return domainError('PROJECT_MEMBER404', '프로젝트 멤버를 찾을 수 없습니다.')
    return HttpResponse.json(ok(toMemberDetail(member)), { status: 200 })
  }),

  http.patch(paths.projects.member(':projectId', ':memberId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const member = db.members.find(
      (m) => m.memberId === Number(params.memberId) && m.projectId === Number(params.projectId),
    )
    if (!member) return domainError('PROJECT_MEMBER404', '프로젝트 멤버를 찾을 수 없습니다.')
    const body = (await request.json()) as { roleNames?: string[] }
    if (body.roleNames?.length) {
      member.roleNames = body.roleNames
    }
    return HttpResponse.json(ok(toMemberDetail(member)), { status: 200 })
  }),

  http.delete(paths.projects.member(':projectId', ':memberId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.memberId)
    const projectId = Number(params.projectId)
    if (!db.members.some((m) => m.memberId === id && m.projectId === projectId)) {
      return domainError('PROJECT_MEMBER404', '프로젝트 멤버를 찾을 수 없습니다.')
    }
    db.members = db.members.filter((m) => !(m.memberId === id && m.projectId === projectId))
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.delete(paths.projects.leave(':projectId'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()
    db.members = db.members.filter((m) => !(m.userId === user.id && m.projectId === projectId))
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.post(paths.projects.invitations(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return notFound()
    const token = `invite-${allocId()}`
    const invitation = {
      token,
      projectId: project.id,
      inviterName: safeUser()!.nickname,
      expiresAt: '2026-12-31T00:00:00Z',
    }
    db.invitations.push(invitation)
    const inviteUrl = `http://localhost:3000/project-invitations/${token}`
    return HttpResponse.json(created({ inviteUrl, expiresAt: invitation.expiresAt }), {
      status: 201,
    })
  }),

  http.get(paths.projectInvitations.byToken(':token'), ({ params }) => {
    const invitation = db.invitations.find((i) => i.token === params.token)
    if (!invitation) {
      return domainError('PROJECT_INVITATION404', '초대 링크를 찾을 수 없습니다.')
    }
    if (isInvitationExpired(invitation.expiresAt)) {
      return domainError('PROJECT_INVITATION_EXPIRED400', '만료된 초대 링크입니다.')
    }
    const project = db.projects.find((p) => p.id === invitation.projectId)
    if (!project) return domainError('PROJECT404', '프로젝트를 찾을 수 없습니다.')
    return HttpResponse.json(
      ok({
        projectId: project.id,
        projectTitle: project.title,
        inviterName: invitation.inviterName,
        status: 'PENDING',
        expiresAt: invitation.expiresAt,
      }),
      { status: 200 },
    )
  }),

  http.post(paths.projectInvitations.accept(':token'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const invitation = db.invitations.find((i) => i.token === params.token)
    if (!invitation) {
      return domainError('PROJECT_INVITATION404', '초대 링크를 찾을 수 없습니다.')
    }
    if (isInvitationExpired(invitation.expiresAt)) {
      return domainError('PROJECT_INVITATION_EXPIRED400', '만료된 초대 링크입니다.')
    }
    if (db.members.some((m) => m.userId === user.id && m.projectId === invitation.projectId)) {
      return domainError('PROJECT_MEMBER409', '이미 프로젝트에 참여 중인 멤버입니다.')
    }
    const body = (await request.json()) as { roleNames?: string[] }
    if (!body.roleNames?.length) return badRequest()
    const memberId = allocId()
    const joinedAt = new Date().toISOString()
    db.members.unshift({
      memberId,
      projectId: invitation.projectId,
      userId: user.id,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      email: user.email,
      bio: user.bio,
      permission: 'MEMBER',
      roleNames: body.roleNames,
      joinedAt,
    })
    return HttpResponse.json(
      ok({
        projectId: invitation.projectId,
        memberId,
        roleNames: body.roleNames,
        joinedAt,
      }),
      { status: 200 },
    )
  }),

  http.get(paths.projects.activities(':projectId'), ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()

    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const size = Number(url.searchParams.get('size') ?? 20)
    const readIds = getReadActivityIds(projectId)
    const items = buildProjectActivities(projectId).map((item) => ({
      ...item,
      isNew: item.isNew && !readIds.has(item.activityId),
    }))
    const sorted = [...items].sort((a, b) => b.activityId - a.activityId)
    const filtered =
      cursor != null ? sorted.filter((item) => item.activityId < Number(cursor)) : sorted
    const page = filtered.slice(0, size)
    const hasNext = filtered.length > size
    const nextCursor = hasNext && page.length > 0 ? String(page[page.length - 1]!.activityId) : null

    return HttpResponse.json(ok({ items: page, nextCursor, hasNext }), { status: 200 })
  }),

  http.patch(paths.projects.activityRead(':projectId', ':activityId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    const activityId = Number(params.activityId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()
    getReadActivityIds(projectId).add(activityId)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.patch(paths.projects.activitiesReadAll(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()
    const readIds = getReadActivityIds(projectId)
    for (const item of buildProjectActivities(projectId)) readIds.add(item.activityId)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.get(paths.projects.files(':projectId'), ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()

    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword')?.toLowerCase()
    const cursor = url.searchParams.get('cursor')
    const size = Number(url.searchParams.get('size') ?? 20)

    let items = db.files.filter((f) => f.projectId === projectId)
    if (keyword) {
      items = items.filter((f) => f.fileName.toLowerCase().includes(keyword))
    }

    const page = paginateByCursor(items, cursor ? Number(cursor) : null, size)
    return HttpResponse.json(
      ok({
        ...page,
        items: page.items.map(toFileListItem),
      }),
      { status: 200 },
    )
  }),

  http.post(paths.projects.files(':projectId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()

    const formData = await request.formData()
    const filePart = formData.get('file')
    const requestPart = formData.get('request')
    if (!(filePart instanceof File) || requestPart == null) return badRequest()

    // FE가 'request' 파트를 Content-Type: application/json Blob으로 보내면 (실 BE 규격과
    // 동일한 방식) 파일명 없는 Blob이라 FormData가 File로 감싸 돌려준다 — 문자열로도,
    // File로도 올 수 있어 둘 다 처리한다.
    const requestText = typeof requestPart === 'string' ? requestPart : await requestPart.text()
    const body = JSON.parse(requestText) as {
      fileName: string
      description?: string
      isFinal?: boolean
    }
    if (!body.fileName) return badRequest()
    if (filePart.size > 100 * 1024 * 1024) {
      return domainError(
        'PROJECT_FILE_SIZE400',
        '프로젝트 파일은 최대 100MB까지 업로드할 수 있습니다.',
      )
    }

    const now = new Date().toISOString()
    const file = {
      id: allocId(),
      projectId,
      fileName: body.fileName,
      description: body.description ?? null,
      storageKey: `projects/${projectId}/files/${body.fileName}`,
      contentType: filePart.type || 'application/octet-stream',
      fileSize: filePart.size,
      isPinned: false,
      isFinal: body.isFinal ?? false,
      uploaderId: user.id,
      createdAt: now,
      updatedAt: now,
    }
    db.files.unshift(file)
    return HttpResponse.json(created(toProjectFile(file)), { status: 201 })
  }),

  http.patch(paths.projects.file(':projectId', ':fileId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const file = db.files.find((f) => f.id === Number(params.fileId))
    if (!file) return notFound()
    const body = (await request.json()) as Partial<typeof file>
    Object.assign(file, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(ok(toProjectFile(file)), { status: 200 })
  }),

  http.delete(paths.projects.file(':projectId', ':fileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.fileId)
    if (!db.files.some((f) => f.id === id)) return notFound()
    db.files = db.files.filter((f) => f.id !== id)
    return HttpResponse.json(ok({ deletedAt: new Date().toISOString() }), { status: 200 })
  }),

  http.get(paths.projects.download(':projectId', ':fileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const file = db.files.find((f) => f.id === Number(params.fileId))
    if (!file) return notFound()
    /** mock 환경엔 실제 업로드 바이트가 없어 파일명을 담은 텍스트로 대체 */
    const body = `mock file content: ${file.fileName}`
    return new HttpResponse(body, {
      status: 200,
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      },
    })
  }),

  http.get(paths.projects.notices(':projectId'), ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()

    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const size = Number(url.searchParams.get('size') ?? 20)
    const items = db.notices.filter((n) => n.projectId === projectId)
    const page = paginateByCursor(items, cursor ? Number(cursor) : null, size)

    return HttpResponse.json(
      ok({
        ...page,
        items: page.items.map(toNoticeListItem),
      }),
      { status: 200 },
    )
  }),

  http.post(paths.projects.notices(':projectId'), async ({ request, params }) => {
    const user = getCurrentUser()
    if (!user || !db.tokens) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()

    const body = (await request.json()) as CreateNoticeRequest
    if (!body.title || !body.content) return badRequest()

    const now = new Date().toISOString()
    const notice = {
      id: allocId(),
      projectId,
      title: body.title,
      content: body.content,
      writerId: user.id,
      writerNickname: user.nickname,
      /** 작성자 본인은 자기 공지를 이미 읽은 것으로 간주 */
      isRead: true,
      createdAt: now,
      updatedAt: now,
    }
    db.notices.unshift(notice)
    return HttpResponse.json(created(toNoticeListItem(notice)), { status: 201 })
  }),

  http.patch(paths.projects.notice(':projectId', ':noticeId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const notice = db.notices.find((n) => n.id === Number(params.noticeId))
    if (!notice || notice.projectId !== Number(params.projectId)) return notFound()

    const body = (await request.json()) as UpdateNoticeRequest
    if (body.title) notice.title = body.title
    if (body.content) notice.content = body.content
    notice.updatedAt = new Date().toISOString()

    return HttpResponse.json(ok(toNoticeListItem(notice)), { status: 200 })
  }),

  http.delete(paths.projects.notice(':projectId', ':noticeId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.noticeId)
    const notice = db.notices.find((n) => n.id === id)
    if (!notice || notice.projectId !== Number(params.projectId)) return notFound()

    db.notices = db.notices.filter((n) => n.id !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.patch(paths.projects.noticeRead(':projectId', ':noticeId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const notice = db.notices.find((n) => n.id === Number(params.noticeId))
    if (!notice || notice.projectId !== Number(params.projectId)) return notFound()

    notice.isRead = true
    const readAt = new Date().toISOString()
    return HttpResponse.json(ok({ id: notice.id, isRead: true, readAt }), { status: 200 })
  }),

  http.post(paths.projects.filePin(':projectId', ':fileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const file = db.files.find((f) => f.id === Number(params.fileId))
    if (!file || file.projectId !== Number(params.projectId)) return notFound()

    file.isPinned = true
    const pinnedAt = new Date().toISOString()
    return HttpResponse.json(ok({ id: file.id, isPinned: true, pinnedAt }), { status: 200 })
  }),

  http.delete(paths.projects.filePin(':projectId', ':fileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const file = db.files.find((f) => f.id === Number(params.fileId))
    if (!file || file.projectId !== Number(params.projectId)) return notFound()

    file.isPinned = false
    return HttpResponse.json(ok({ id: file.id, isPinned: false, pinnedAt: null }), { status: 200 })
  }),
]
