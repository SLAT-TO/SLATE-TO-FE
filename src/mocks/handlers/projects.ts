import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type { CreateProjectRequest, UpdateProjectRequest } from '../../types/project'
import type { CreateNoticeRequest, UpdateNoticeRequest } from '../../types/notice'
import { allocId, db, getCurrentUser, requireUser } from '../db'
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

export const projectHandlers = [
  http.get(paths.projects.root, () => {
    if (!safeUser()) return unauthorized()
    return HttpResponse.json(ok(db.projects), { status: 200 })
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
      !body.jobRole
    ) {
      return badRequest()
    }
    if (db.projects.length >= FREE_PROJECT_LIMIT) {
      return domainError('PROJECT409', '무료 계정은 최대 5개의 프로젝트만 생성할 수 있습니다.')
    }

    const now = new Date().toISOString()
    const project = {
      id: allocId(),
      title: body.title,
      description: body.description,
      type: body.type,
      customTypeName: body.customTypeName ?? null,
      lengthType: body.lengthType,
      clientName: body.clientName ?? null,
      status: 'PREPARING',
      endDate: body.endDate,
      createdAt: now,
      updatedAt: now,
    }
    db.projects.unshift(project)

    db.members.unshift({
      id: allocId(),
      userId: user.id,
      name: user.nickname,
      profileImageUrl: user.profileImageUrl,
      email: user.email,
      region: user.location,
      jobRole: body.jobRole,
      isAdmin: true,
    })

    return HttpResponse.json(
      created({
        id: project.id,
        title: project.title,
        status: project.status,
        permission: 'ADMIN',
        startDate: now.slice(0, 10),
        createdAt: now,
      }),
      { status: 201 },
    )
  }),

  http.get(paths.projects.byId(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return notFound()
    return HttpResponse.json(ok(project), { status: 200 })
  }),

  http.patch(paths.projects.byId(':projectId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const project = db.projects.find((p) => p.id === Number(params.projectId))
    if (!project) return notFound()
    const body = (await request.json()) as UpdateProjectRequest
    Object.assign(project, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(ok({ id: project.id, updatedAt: project.updatedAt }), { status: 200 })
  }),

  http.delete(paths.projects.byId(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.projectId)
    if (!db.projects.some((p) => p.id === id)) return notFound()
    db.projects = db.projects.filter((p) => p.id !== id)
    return HttpResponse.json(ok({ deletedAt: new Date().toISOString() }), { status: 200 })
  }),

  http.get(paths.projects.members(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
    return HttpResponse.json(ok(db.members), { status: 200 })
  }),

  http.get(paths.projects.member(':projectId', ':memberId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const member = db.members.find((m) => m.id === Number(params.memberId))
    if (!member) return notFound()
    return HttpResponse.json(ok(member), { status: 200 })
  }),

  http.patch(paths.projects.member(':projectId', ':memberId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const member = db.members.find((m) => m.id === Number(params.memberId))
    if (!member) return notFound()
    const body = (await request.json()) as { jobRole?: string }
    if (body.jobRole) member.jobRole = body.jobRole
    return HttpResponse.json(ok(member), { status: 200 })
  }),

  http.delete(paths.projects.member(':projectId', ':memberId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.memberId)
    if (!db.members.some((m) => m.id === id)) return notFound()
    db.members = db.members.filter((m) => m.id !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.delete(paths.projects.leave(':projectId'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
    db.members = db.members.filter((m) => m.userId !== user.id)
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
      status: 'PENDING' as const,
    }
    db.invitations.push(invitation)
    const inviteUrl = `${self.location.origin}/invitations/${token}`
    return HttpResponse.json(created({ inviteUrl, expiresAt: invitation.expiresAt }), {
      status: 201,
    })
  }),

  http.get(paths.projectInvitations.byToken(':token'), ({ params }) => {
    const invitation = db.invitations.find((i) => i.token === params.token)
    if (!invitation) {
      return domainError('INVITE400', '유효하지 않거나 만료된 초대 링크입니다.')
    }
    const project = db.projects.find((p) => p.id === invitation.projectId)
    if (!project) return notFound()
    const isExpired = new Date(invitation.expiresAt).getTime() < Date.now()
    return HttpResponse.json(
      ok({
        projectId: project.id,
        projectTitle: project.title,
        inviterName: invitation.inviterName,
        status: isExpired ? 'EXPIRED' : invitation.status,
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
      return domainError('INVITE400', '유효하지 않거나 만료된 초대 링크입니다.')
    }
    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      return domainError('INVITE400', '유효하지 않거나 만료된 초대 링크입니다.')
    }
    if (db.members.some((m) => m.userId === user.id)) {
      return domainError('PROJECT409', '이미 프로젝트에 참여 중입니다.')
    }
    const body = (await request.json()) as { roleNames?: string[] }
    if (!body.roleNames?.length) return badRequest()
    const memberId = allocId()
    const joinedAt = new Date().toISOString()
    db.members.unshift({
      id: memberId,
      userId: user.id,
      name: user.nickname,
      profileImageUrl: user.profileImageUrl,
      email: user.email,
      region: user.location,
      jobRole: body.roleNames[0],
      roleNames: body.roleNames,
      isAdmin: false,
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
    const size = Number(url.searchParams.get('size') ?? 30)
    const items = db.activities.filter((a) => a.projectId === projectId)
    const page = paginateByCursor(items, cursor ? Number(cursor) : null, size)

    return HttpResponse.json(ok(page), { status: 200 })
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

  http.post(paths.projects.uploadUrl(':projectId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
    const body = (await request.json()) as {
      fileName: string
      contentType: string
      fileSize: number
    }
    if (!body.fileName || !body.contentType || body.fileSize == null) return badRequest()
    if (body.fileSize > 100 * 1024 * 1024) {
      return domainError('FILE400', '지원하지 않는 파일이거나 파일 크기가 제한을 초과했습니다.')
    }

    return HttpResponse.json(
      created({
        uploadUrl: 'https://example.com/mock-upload',
        storageKey: `projects/${params.projectId}/files/${body.fileName}`,
        expiresAt: '2026-12-31T00:00:00Z',
        requiredHeaders: { 'Content-Type': body.contentType },
      }),
      { status: 201 },
    )
  }),

  http.post(paths.projects.files(':projectId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()
    const body = (await request.json()) as {
      fileName: string
      description?: string
      storageKey: string
      contentType: string
      fileSize: number
      isPinned?: boolean
    }
    const now = new Date().toISOString()
    const file = {
      id: allocId(),
      projectId,
      fileName: body.fileName,
      description: body.description ?? null,
      storageKey: body.storageKey,
      contentType: body.contentType,
      fileSize: body.fileSize,
      isPinned: body.isPinned ?? false,
      isFinal: false,
      uploaderId: user.id,
      createdAt: now,
      updatedAt: now,
    }
    db.files.unshift(file)
    return HttpResponse.json(created(file), { status: 201 })
  }),

  http.patch(paths.projects.file(':projectId', ':fileId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const file = db.files.find((f) => f.id === Number(params.fileId))
    if (!file) return notFound()
    const body = (await request.json()) as Partial<typeof file>
    Object.assign(file, body, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(ok(file), { status: 200 })
  }),

  http.delete(paths.projects.file(':projectId', ':fileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.fileId)
    if (!db.files.some((f) => f.id === id)) return notFound()
    db.files = db.files.filter((f) => f.id !== id)
    return HttpResponse.json(ok({ deletedAt: new Date().toISOString() }), { status: 200 })
  }),

  http.get(paths.projects.downloadUrl(':projectId', ':fileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const file = db.files.find((f) => f.id === Number(params.fileId))
    if (!file) return notFound()
    return HttpResponse.json(
      ok({
        downloadUrl: `https://example.com/mock-download/${file.storageKey}`,
        expiresAt: '2026-12-31T00:00:00Z',
      }),
      { status: 200 },
    )
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
]
