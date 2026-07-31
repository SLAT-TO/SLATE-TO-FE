import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type {
  BookmarkVideoRequest,
  CreateVideoRequest,
  UpdateVideoRequest,
  ValidateYoutubeRequest,
} from '../../types/video'
import type {
  CreateFeedbackRequest,
  CreateReplyRequest,
  RegisterGuestRequest,
} from '../../types/feedback'
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

export const videoHandlers = [
  http.get(paths.projects.videos(':projectId'), ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()

    const url = new URL(request.url)
    const size = Number(url.searchParams.get('size') ?? 20)
    const videos = db.videos
      .filter((v) => v.projectId === projectId)
      .slice(0, size)
      .map((v) => ({
        videoId: v.videoId,
        title: v.title,
        thumbnailUrl: v.thumbnailUrl,
        bookmarked: v.bookmarked,
        progressStatus: v.progressStatus,
        unreadCommentCount: v.unreadCommentCount,
        updatedAt: v.updatedAt,
      }))

    return HttpResponse.json(
      ok({
        items: videos,
        nextCursor: videos.length ? videos[videos.length - 1].videoId : null,
        hasNext: false,
      }),
      { status: 200 },
    )
  }),

  http.post(paths.projects.videos(':projectId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const projectId = Number(params.projectId)
    if (!db.projects.some((p) => p.id === projectId)) return notFound()
    const body = (await request.json()) as CreateVideoRequest
    if (!body.youtubeUrl || !body.title) return badRequest()

    const videoId = allocId()
    const createdAt = new Date().toISOString()
    const video = {
      videoId,
      projectId,
      title: body.title,
      youtubeUrl: body.youtubeUrl,
      youtubeVideoId: 'mockVideo',
      thumbnailUrl: 'https://img.youtube.com/vi/mockVideo/maxresdefault.jpg',
      progressStatus: 'IN_PROGRESS' as const,
      bookmarked: false,
      unreadCommentCount: 0,
      description: null,
      memo: body.memo ?? null,
      projectTags: [],
      createdAt,
      updatedAt: createdAt,
    }
    db.videos.unshift(video)

    return HttpResponse.json(
      created({
        videoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: 1018,
        bookmarked: false,
        progressStatus: video.progressStatus,
        createdAt,
      }),
      { status: 201 },
    )
  }),

  http.get(paths.projects.video(':projectId', ':videoId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const video = db.videos.find(
      (v) => v.projectId === Number(params.projectId) && v.videoId === Number(params.videoId),
    )
    if (!video) return notFound()
    return HttpResponse.json(ok(video), { status: 200 })
  }),

  http.patch(paths.projects.video(':projectId', ':videoId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const video = db.videos.find((v) => v.videoId === Number(params.videoId))
    if (!video) return notFound()
    const body = (await request.json()) as UpdateVideoRequest
    if (body.title !== undefined) video.title = body.title
    if (body.memo !== undefined) video.memo = body.memo
    video.updatedAt = new Date().toISOString()
    return HttpResponse.json(
      ok({
        videoId: video.videoId,
        title: video.title,
        memo: video.memo,
        updatedAt: video.updatedAt,
      }),
      { status: 200 },
    )
  }),

  http.delete(paths.projects.video(':projectId', ':videoId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const videoId = Number(params.videoId)
    if (!db.videos.some((v) => v.videoId === videoId)) return notFound()
    db.videos = db.videos.filter((v) => v.videoId !== videoId)
    return HttpResponse.json(ok({ videoId, message: '영상이 삭제되었습니다.' }), { status: 200 })
  }),

  http.patch(
    paths.projects.videoBookmark(':projectId', ':videoId'),
    async ({ request, params }) => {
      if (!safeUser()) return unauthorized()
      const video = db.videos.find((v) => v.videoId === Number(params.videoId))
      if (!video) return notFound()
      const body = (await request.json()) as BookmarkVideoRequest
      video.bookmarked = body.bookmarked
      return HttpResponse.json(
        ok({
          videoId: video.videoId,
          bookmarked: video.bookmarked,
          message: '북마크 상태가 변경되었습니다.',
        }),
        { status: 200 },
      )
    },
  ),

  http.post(paths.videos.validateYoutube, async ({ request }) => {
    if (!safeUser()) return unauthorized()
    const body = (await request.json()) as ValidateYoutubeRequest
    if (!body.youtubeUrl?.includes('youtu')) return badRequest('YouTube URL 형식이 아님')
    return HttpResponse.json(
      ok({
        valid: true,
        youtubeVideoId: 'abc123',
        title: '영상 제목',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
        playable: true,
        message: '등록 가능한 영상입니다.',
      }),
      { status: 200 },
    )
  }),

  http.get(paths.videos.referenceFiles(':videoId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.videos.some((v) => v.videoId === Number(params.videoId))) return notFound()
    return HttpResponse.json(ok({ items: db.referenceFiles }), { status: 200 })
  }),

  http.post(paths.videos.referenceFiles(':videoId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    if (!db.videos.some((v) => v.videoId === Number(params.videoId))) return notFound()
    const body = (await request.json()) as { projectFileId: number }
    const file = db.files.find((f) => f.id === body.projectFileId)
    if (!file) return notFound()
    const ref = {
      referenceFileId: allocId(),
      projectFileId: file.id,
      fileName: file.fileName,
      contentType: file.contentType,
      fileSize: file.fileSize,
      isFinal: false,
      createdAt: new Date().toISOString(),
    }
    db.referenceFiles.push(ref)
    return HttpResponse.json(created(ref), { status: 201 })
  }),

  http.delete(paths.videos.referenceFile(':videoId', ':referenceFileId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.referenceFileId)
    if (!db.referenceFiles.some((r) => r.referenceFileId === id)) return notFound()
    db.referenceFiles = db.referenceFiles.filter((r) => r.referenceFileId !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.get(paths.videos.feedbacks(':videoId'), ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')

    let items = db.feedbacks.filter((f) => f.videoId === Number(params.videoId))
    if (statusParam !== null) {
      const wantResolved = statusParam === 'true'
      items = items.filter((f) => f.status === wantResolved)
    }
    // startTime 오름차순, null(타임코드 없음)은 맨 뒤
    items = [...items].sort((a, b) => {
      if (a.startTime === null && b.startTime === null) return 0
      if (a.startTime === null) return 1
      if (b.startTime === null) return -1
      return a.startTime - b.startTime
    })

    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.post(paths.videos.feedbacks(':videoId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as CreateFeedbackRequest
    if (!body.content) return badRequest()
    if (body.endTime !== undefined && body.startTime === undefined) return badRequest()
    const now = new Date().toISOString()
    const feedback = {
      feedbackId: allocId(),
      videoId: Number(params.videoId),
      actor: { type: 'USER' as const, id: user.id, name: user.nickname },
      content: body.content,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      status: false,
      createdAt: now,
      updatedAt: now,
    }
    db.feedbacks.unshift(feedback)
    return HttpResponse.json(created(feedback), { status: 201 })
  }),

  http.patch(paths.feedbacks.byId(':feedbackId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const feedback = db.feedbacks.find((f) => f.feedbackId === Number(params.feedbackId))
    if (!feedback) return notFound()
    const body = (await request.json()) as Partial<CreateFeedbackRequest>
    if (body.content !== undefined) feedback.content = body.content
    if (body.startTime !== undefined) feedback.startTime = body.startTime
    if (body.endTime !== undefined) feedback.endTime = body.endTime
    feedback.updatedAt = new Date().toISOString()
    return HttpResponse.json(ok(feedback), { status: 200 })
  }),

  http.delete(paths.feedbacks.byId(':feedbackId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const id = Number(params.feedbackId)
    if (!db.feedbacks.some((f) => f.feedbackId === id)) return notFound()
    db.feedbacks = db.feedbacks.filter((f) => f.feedbackId !== id)
    return HttpResponse.json(ok(null), { status: 200 })
  }),

  http.patch(paths.feedbacks.status(':feedbackId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const feedback = db.feedbacks.find((f) => f.feedbackId === Number(params.feedbackId))
    if (!feedback) return notFound()
    const body = (await request.json()) as { userId?: number; status: boolean }
    if (body.userId == null || body.status === undefined) return badRequest()
    feedback.status = body.status
    feedback.updatedAt = new Date().toISOString()
    return HttpResponse.json(
      ok({
        feedbackId: feedback.feedbackId,
        status: feedback.status,
        updatedAt: feedback.updatedAt,
      }),
      { status: 200 },
    )
  }),

  http.get(paths.feedbacks.replies(':feedbackId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const items = db.replies.filter((r) => r.feedbackId === Number(params.feedbackId))
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.post(paths.feedbacks.replies(':feedbackId'), async ({ request, params }) => {
    const user = safeUser()
    if (!user) return unauthorized()
    const body = (await request.json()) as CreateReplyRequest
    if (!body.content) return badRequest()
    const now = new Date().toISOString()
    const reply = {
      replyId: allocId(),
      feedbackId: Number(params.feedbackId),
      actor: { type: 'USER' as const, id: user.id, name: user.nickname },
      content: body.content,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      status: false,
      createdAt: now,
      updatedAt: now,
    }
    db.replies.push(reply)
    return HttpResponse.json(created(reply), { status: 201 })
  }),

  http.patch(paths.replies.byId(':replyId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const reply = db.replies.find((r) => r.replyId === Number(params.replyId))
    if (!reply) return notFound()
    const body = (await request.json()) as { content?: string; deleted?: boolean }
    if (body.deleted) {
      db.replies = db.replies.filter((r) => r.replyId !== reply.replyId)
      return HttpResponse.json(ok(null), { status: 200 })
    }
    if (body.content) {
      reply.content = body.content
      reply.updatedAt = new Date().toISOString()
    }
    return HttpResponse.json(ok(reply), { status: 200 })
  }),

  http.patch(paths.replies.status(':replyId'), async ({ request, params }) => {
    if (!safeUser()) return unauthorized()
    const reply = db.replies.find((r) => r.replyId === Number(params.replyId))
    if (!reply) return notFound()
    const body = (await request.json()) as { userId?: number; status: boolean }
    if (body.userId == null || body.status === undefined) return badRequest()
    reply.status = body.status
    reply.updatedAt = new Date().toISOString()
    return HttpResponse.json(
      ok({
        replyId: reply.replyId,
        status: reply.status,
        updatedAt: reply.updatedAt,
      }),
      { status: 200 },
    )
  }),

  http.post(paths.videos.shareLinks(':videoId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const videoId = Number(params.videoId)
    if (!db.videos.some((v) => v.videoId === videoId)) return notFound()
    const link = {
      shareLinkId: allocId(),
      videoId,
      token: `share-${allocId()}`,
      isActive: true,
      expiredAt: '2026-12-31T00:00:00Z',
      createdAt: new Date().toISOString(),
    }
    db.shareLinks.push(link)
    return HttpResponse.json(created(link), { status: 201 })
  }),

  http.get(paths.videos.shareLinks(':videoId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const items = db.shareLinks.filter((s) => s.videoId === Number(params.videoId))
    return HttpResponse.json(ok({ items }), { status: 200 })
  }),

  http.get(paths.shareLinks.byToken(':token'), ({ params }) => {
    const link = db.shareLinks.find((s) => s.token === params.token && s.isActive)
    if (!link) return notFound()
    const video = db.videos.find((v) => v.videoId === link.videoId)
    return HttpResponse.json(
      ok({
        videoId: link.videoId,
        videoTitle: video?.title ?? '',
        requiresNickname: true,
      }),
      { status: 200 },
    )
  }),

  http.post(paths.shareLinks.guests(':token'), async ({ request, params }) => {
    const link = db.shareLinks.find((s) => s.token === params.token && s.isActive)
    if (!link) return notFound()
    const body = (await request.json()) as RegisterGuestRequest
    if (!body.name) return badRequest()
    return HttpResponse.json(
      created({
        guestId: allocId(),
        shareLinkId: link.shareLinkId,
        name: body.name,
        createdAt: new Date().toISOString(),
      }),
      { status: 201 },
    )
  }),

  http.patch(paths.shareLinks.byId(':shareLinkId'), ({ params }) => {
    if (!safeUser()) return unauthorized()
    const link = db.shareLinks.find((s) => s.shareLinkId === Number(params.shareLinkId))
    if (!link) return notFound()
    link.isActive = false
    return HttpResponse.json(ok(link), { status: 200 })
  }),
]
