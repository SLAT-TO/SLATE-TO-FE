import { request, requestBlob } from './client'
import { ApiError } from '../types/api'
import {
  normalizeFeedback,
  normalizeFeedbackReply,
  normalizeVideoList,
  toFeedbackStatus,
  type BeVideoListRaw,
  type FeedbackReplyStatusRaw,
  type FeedbackStatusRaw,
} from './normalize'
import { paths } from './paths'
import type {
  BookmarkVideoRequest,
  BookmarkVideoResult,
  CreateVideoRequest,
  CreateVideoResult,
  GuestVideoDetail,
  LinkReferenceFileResult,
  ReferenceFile,
  UpdateVideoRequest,
  UpdateVideoResult,
  ValidateYoutubeRequest,
  ValidateYoutubeResult,
  VideoDetail,
  VideoListResult,
} from '../types/video'
import type {
  CreateFeedbackRequest,
  CreateReplyRequest,
  Feedback,
  FeedbackListEntry,
  FeedbackReply,
  GuestListResult,
  RegisterGuestRequest,
  RegisterGuestResult,
  ShareLink,
  ShareLinkAccess,
  UpdateFeedbackRequest,
  UpdateFeedbackStatusRequest,
  UpdateReplyStatusRequest,
} from '../types/feedback'

export async function getVideos(
  projectId: number,
  cursor?: number,
  size = 20,
): Promise<VideoListResult> {
  const result = await request<BeVideoListRaw>({
    method: 'GET',
    url: paths.projects.videos(projectId),
    params: { cursor, size },
  })
  return normalizeVideoList(result)
}

export async function createVideo(
  projectId: number,
  body: CreateVideoRequest,
): Promise<CreateVideoResult> {
  return request({ method: 'POST', url: paths.projects.videos(projectId), data: body })
}

export async function getVideo(projectId: number, videoId: number): Promise<VideoDetail> {
  return request({ method: 'GET', url: paths.projects.video(projectId, videoId) })
}

export async function deleteVideo(
  projectId: number,
  videoId: number,
): Promise<{ videoId: number; message: string }> {
  return request({ method: 'DELETE', url: paths.projects.video(projectId, videoId) })
}

export async function updateVideo(
  projectId: number,
  videoId: number,
  body: UpdateVideoRequest,
): Promise<UpdateVideoResult> {
  return request({ method: 'PATCH', url: paths.projects.video(projectId, videoId), data: body })
}

export async function updateVideoBookmark(
  projectId: number,
  videoId: number,
  body: BookmarkVideoRequest,
): Promise<BookmarkVideoResult> {
  return request({
    method: 'PATCH',
    url: paths.projects.videoBookmark(projectId, videoId),
    data: body,
  })
}

export async function validateYoutubeUrl(
  body: ValidateYoutubeRequest,
): Promise<ValidateYoutubeResult> {
  return request({ method: 'POST', url: paths.videos.validateYoutube, data: body })
}

export async function getReferenceFiles(
  projectId: number,
  videoId: number,
): Promise<{ items: ReferenceFile[] }> {
  return request({ method: 'GET', url: paths.projects.referenceFiles(projectId, videoId) })
}

export async function linkReferenceFile(
  projectId: number,
  videoId: number,
  projectFileId: number,
): Promise<LinkReferenceFileResult> {
  return request({
    method: 'POST',
    url: paths.projects.referenceFiles(projectId, videoId),
    data: { projectFileId },
  })
}

export async function unlinkReferenceFile(
  projectId: number,
  videoId: number,
  referenceFileId: number,
): Promise<null> {
  return request({
    method: 'DELETE',
    url: paths.projects.referenceFile(projectId, videoId, referenceFileId),
  })
}

type GuestRequestOptions = { guestId?: number; guestToken?: string }

/** 게스트 신원은 guestId·sessionToken 둘 다 X-Guest-Id·X-Guest-Token 헤더로 보낸다 (BE #181).
 * 두 값을 독립적으로 다뤄서, 실제로는 안 쓰이는 조합(예: guestId 없이 guestToken만)이
 * 와도 있는 값은 그대로 보낸다 — 헤더가 조용히 통째로 버려지지 않게. */
function guestRequestConfig(options?: GuestRequestOptions) {
  const headers: Record<string, string> = {}
  if (options?.guestId != null) headers['X-Guest-Id'] = String(options.guestId)
  if (options?.guestToken) headers['X-Guest-Token'] = options.guestToken
  return Object.keys(headers).length > 0 ? { headers } : {}
}

export async function getFeedbacks(
  videoId: number,
  options?: GuestRequestOptions,
): Promise<{ items: FeedbackListEntry[] }> {
  const result = await request<{ items: (FeedbackStatusRaw & { replyCount: number })[] }>({
    method: 'GET',
    url: paths.videos.feedbacks(videoId),
    ...guestRequestConfig(options),
  })
  return {
    items: result.items.map((raw) => ({ ...normalizeFeedback(raw), replyCount: raw.replyCount })),
  }
}

export async function createFeedback(
  videoId: number,
  body: CreateFeedbackRequest,
  options?: GuestRequestOptions,
): Promise<Feedback> {
  const result = await request<FeedbackStatusRaw>({
    method: 'POST',
    url: paths.videos.feedbacks(videoId),
    data: {
      content: body.content,
      ...(body.startTime != null ? { startTime: body.startTime } : {}),
      ...(body.endTime != null ? { endTime: body.endTime } : {}),
    },
    ...guestRequestConfig(options),
  })
  return normalizeFeedback(result)
}

export async function updateFeedback(
  feedbackId: number,
  body: UpdateFeedbackRequest,
  options?: GuestRequestOptions,
): Promise<Feedback> {
  const result = await request<FeedbackStatusRaw>({
    method: 'PATCH',
    url: paths.feedbacks.byId(feedbackId),
    data: {
      ...(body.content != null ? { content: body.content } : {}),
      ...(body.startTime != null ? { startTime: body.startTime } : {}),
      ...(body.endTime != null ? { endTime: body.endTime } : {}),
    },
    ...guestRequestConfig(options),
  })
  return normalizeFeedback(result)
}

export async function deleteFeedback(
  feedbackId: number,
  options?: GuestRequestOptions,
): Promise<null> {
  return request({
    method: 'DELETE',
    url: paths.feedbacks.byId(feedbackId),
    ...guestRequestConfig(options),
  })
}

export async function updateFeedbackStatus(
  feedbackId: number,
  body: UpdateFeedbackStatusRequest,
): Promise<{ feedbackId: number; status: boolean; updatedAt: string }> {
  const result = await request<{ feedbackId: number; status: unknown; updatedAt: string }>({
    method: 'PATCH',
    url: paths.feedbacks.status(feedbackId),
    data: { status: body.status },
  })
  return { ...result, status: toFeedbackStatus(result.status) }
}

export async function getReplies(
  feedbackId: number,
  options?: GuestRequestOptions,
): Promise<{ items: FeedbackReply[] }> {
  const result = await request<{ items: FeedbackReplyStatusRaw[] }>({
    method: 'GET',
    url: paths.feedbacks.replies(feedbackId),
    ...guestRequestConfig(options),
  })
  return { items: result.items.map(normalizeFeedbackReply) }
}

export async function createReply(
  feedbackId: number,
  body: CreateReplyRequest,
  options?: GuestRequestOptions,
): Promise<FeedbackReply> {
  const result = await request<FeedbackReplyStatusRaw>({
    method: 'POST',
    url: paths.feedbacks.replies(feedbackId),
    data: { content: body.content },
    ...guestRequestConfig(options),
  })
  return normalizeFeedbackReply(result)
}

export async function updateReply(
  replyId: number,
  body: { content: string },
  options?: GuestRequestOptions,
): Promise<FeedbackReply | null> {
  const result = await request<FeedbackReplyStatusRaw | null>({
    method: 'PATCH',
    url: paths.replies.byId(replyId),
    data: body,
    ...guestRequestConfig(options),
  })
  return result ? normalizeFeedbackReply(result) : null
}

export async function deleteReply(replyId: number, options?: GuestRequestOptions): Promise<null> {
  return request({
    method: 'DELETE',
    url: paths.replies.byId(replyId),
    ...guestRequestConfig(options),
  })
}

export async function updateReplyStatus(
  replyId: number,
  body: UpdateReplyStatusRequest,
): Promise<{ replyId: number; status: boolean; updatedAt: string }> {
  const result = await request<{ replyId: number; status: unknown; updatedAt: string }>({
    method: 'PATCH',
    url: paths.replies.status(replyId),
    data: { status: body.status },
  })
  return { ...result, status: toFeedbackStatus(result.status) }
}

export async function createShareLink(
  videoId: number,
  body?: { expiredAt?: string },
): Promise<ShareLink> {
  return request({
    method: 'POST',
    url: paths.videos.shareLinks(videoId),
    data: body ?? {},
  })
}

/** BE는 영상당 단건 ShareLinkInfoResDTO. 없으면 404 — 호출부에서 처리 */
export async function getShareLink(videoId: number): Promise<ShareLink> {
  return request({ method: 'GET', url: paths.videos.shareLinks(videoId) })
}

/** 소유자용 — 프로젝트 활성 멤버만 조회 가능, 세션 토큰 등 민감 정보는 내려오지 않음 */
export async function getShareLinkGuests(
  videoId: number,
  shareLinkId: number,
): Promise<GuestListResult> {
  return request({ method: 'GET', url: paths.videos.shareLinkGuests(videoId, shareLinkId) })
}

/** @deprecated BE 단건 응답 — getShareLink 사용. 하위호환용으로 items 래핑 */
export async function getShareLinks(videoId: number): Promise<{ items: ShareLink[] }> {
  try {
    const link = await getShareLink(videoId)
    return { items: [link] }
  } catch (err) {
    if (err instanceof ApiError && err.code === 'COMMON404') return { items: [] }
    throw err
  }
}

export async function accessShareLink(token: string): Promise<ShareLinkAccess> {
  return request({ method: 'GET', url: paths.shareLinks.byToken(token) })
}

export async function registerGuest(
  token: string,
  body: RegisterGuestRequest,
): Promise<RegisterGuestResult> {
  return request({ method: 'POST', url: paths.shareLinks.guests(token), data: body })
}

export async function getGuestVideoDetail(
  token: string,
  options: GuestRequestOptions,
): Promise<GuestVideoDetail> {
  return request({
    method: 'GET',
    url: paths.shareLinks.video(token),
    ...guestRequestConfig(options),
  })
}

export async function getGuestReferenceFiles(
  token: string,
  options: GuestRequestOptions,
): Promise<{ items: ReferenceFile[] }> {
  return request({
    method: 'GET',
    url: paths.shareLinks.files(token),
    ...guestRequestConfig(options),
  })
}

/** 게스트 다운로드는 projectFileId가 아니라 목록 응답의 referenceFileId로 받는다 (BE가 내부 파일 식별자를 노출하지 않음) */
export async function downloadGuestReferenceFile(
  token: string,
  referenceFileId: number,
  options: GuestRequestOptions,
): Promise<Blob> {
  return requestBlob({
    method: 'GET',
    url: paths.shareLinks.fileDownload(token, referenceFileId),
    ...guestRequestConfig(options),
  })
}

/** BE 토글 — isActive만 갱신된 응답 */
export async function deactivateShareLink(
  shareLinkId: number,
): Promise<{ shareLinkId: number; isActive: boolean }> {
  return request({ method: 'PATCH', url: paths.shareLinks.byId(shareLinkId) })
}
