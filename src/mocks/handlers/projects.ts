import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type { CreateProjectRequest, UpdateProjectRequest } from '../../types/project'
import { allocId, db, requireUser } from '../db'
import { badRequest, notFound, unauthorized } from '../errors'
import { created, ok } from '../response'

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

export const projectHandlers = [
  http.get(paths.projects.root, () => {
    if (!safeUser()) return unauthorized()
    return HttpResponse.json(ok(db.projects), { status: 200 })
  }),

  http.post(paths.projects.root, async ({ request }) => {
    if (!safeUser()) return unauthorized()
    const body = (await request.json()) as CreateProjectRequest
    if (!body.title || !body.type) return badRequest()

    const now = new Date().toISOString()
    const project = {
      id: allocId(),
      title: body.title,
      description: body.description ?? null,
      type: body.type,
      customTypeName: body.customTypeName ?? null,
      lengthType: body.lengthType ?? null,
      clientName: body.clientName ?? null,
      status: 'PREPARING',
      endDate: body.endDate ?? null,
      createdAt: now,
      updatedAt: now,
    }
    db.projects.unshift(project)
    return HttpResponse.json(created(project), { status: 201 })
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
    }
    db.invitations.push(invitation)
    return HttpResponse.json(created({ token, expiresAt: invitation.expiresAt }), { status: 201 })
  }),

  http.get(paths.projectInvitations.byToken(':token'), ({ params }) => {
    const invitation = db.invitations.find((i) => i.token === params.token)
    if (!invitation) {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: 'INVITE400',
          message: '유효하지 않거나 만료된 초대 링크입니다.',
          result: null,
        },
        { status: 400 },
      )
    }
    const project = db.projects.find((p) => p.id === invitation.projectId)
    if (!project) return notFound()
    return HttpResponse.json(
      ok({
        projectId: project.id,
        projectTitle: project.title,
        inviterName: invitation.inviterName,
        status: project.status,
        expiresAt: invitation.expiresAt,
      }),
      { status: 200 },
    )
  }),

  http.post(paths.projectInvitations.accept(':token'), ({ params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const invitation = db.invitations.find((i) => i.token === params.token)
    if (!invitation) {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: 'INVITE400',
          message: '유효하지 않거나 만료된 초대 링크입니다.',
          result: null,
        },
        { status: 400 },
      )
    }
    return HttpResponse.json(ok({ projectId: invitation.projectId, joined: true }), { status: 200 })
  }),

  http.get(paths.projects.activities(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
    return HttpResponse.json(ok({ items: db.activities }), { status: 200 })
  }),

  http.get(paths.projects.files(':projectId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
    return HttpResponse.json(ok({ items: db.files }), { status: 200 })
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
      return HttpResponse.json(
        {
          isSuccess: false,
          code: 'FILE400',
          message: '지원하지 않는 파일이거나 파일 크기가 제한을 초과했습니다.',
          result: null,
        },
        { status: 400 },
      )
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
    if (!safeUser()) return unauthorized()
    if (!db.projects.some((p) => p.id === Number(params.projectId))) return notFound()
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
      fileName: body.fileName,
      description: body.description ?? null,
      storageKey: body.storageKey,
      contentType: body.contentType,
      fileSize: body.fileSize,
      isPinned: body.isPinned ?? false,
      isFinal: false,
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
]
