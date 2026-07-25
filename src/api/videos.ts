import { request } from './client'
import { normalizeVideoList, type BeVideoListRaw } from './normalize'
import { paths } from './paths'
import type {
  BookmarkVideoRequest,
  BookmarkVideoResult,
  CreateVideoRequest,
  CreateVideoResult,
  ReferenceFile,
  ValidateYoutubeRequest,
  ValidateYoutubeResult,
  VideoDetail,
  VideoListResult,
} from '../types/video'
import type {
  CreateFeedbackRequest,
  CreateReplyRequest,
  Feedback,
  FeedbackReply,
  RegisterGuestRequest,
  ShareLink,
  ShareLinkAccess,
  UpdateFeedbackRequest,
  UpdateFeedbackStatusRequest,
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

export async function getReferenceFiles(videoId: number): Promise<{ items: ReferenceFile[] }> {
  return request({ method: 'GET', url: paths.videos.referenceFiles(videoId) })
}

export async function linkReferenceFile(
  videoId: number,
  projectFileId: number,
): Promise<ReferenceFile> {
  return request({
    method: 'POST',
    url: paths.videos.referenceFiles(videoId),
    data: { projectFileId },
  })
}

export async function unlinkReferenceFile(videoId: number, referenceFileId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.videos.referenceFile(videoId, referenceFileId) })
}

export async function getFeedbacks(videoId: number): Promise<{ items: Feedback[] }> {
  return request({ method: 'GET', url: paths.videos.feedbacks(videoId) })
}

export async function createFeedback(
  videoId: number,
  body: CreateFeedbackRequest,
): Promise<Feedback> {
  return request({ method: 'POST', url: paths.videos.feedbacks(videoId), data: body })
}

export async function updateFeedback(
  feedbackId: number,
  body: UpdateFeedbackRequest,
): Promise<Feedback> {
  return request({ method: 'PATCH', url: paths.feedbacks.byId(feedbackId), data: body })
}

export async function deleteFeedback(feedbackId: number): Promise<null> {
  return request({ method: 'DELETE', url: paths.feedbacks.byId(feedbackId) })
}

export async function updateFeedbackStatus(
  feedbackId: number,
  body: UpdateFeedbackStatusRequest,
): Promise<{ feedbackId: number; status: boolean; updatedAt: string }> {
  return request({ method: 'PATCH', url: paths.feedbacks.status(feedbackId), data: body })
}

export async function getReplies(feedbackId: number): Promise<{ items: FeedbackReply[] }> {
  return request({ method: 'GET', url: paths.feedbacks.replies(feedbackId) })
}

export async function createReply(
  feedbackId: number,
  body: CreateReplyRequest,
): Promise<FeedbackReply> {
  return request({ method: 'POST', url: paths.feedbacks.replies(feedbackId), data: body })
}

export async function updateReply(
  replyId: number,
  body: { content?: string; deleted?: boolean },
): Promise<FeedbackReply | null> {
  return request({ method: 'PATCH', url: paths.replies.byId(replyId), data: body })
}

export async function createShareLink(videoId: number): Promise<ShareLink> {
  return request({ method: 'POST', url: paths.videos.shareLinks(videoId) })
}

export async function getShareLinks(videoId: number): Promise<{ items: ShareLink[] }> {
  return request({ method: 'GET', url: paths.videos.shareLinks(videoId) })
}

export async function accessShareLink(token: string): Promise<ShareLinkAccess> {
  return request({ method: 'GET', url: paths.shareLinks.byToken(token) })
}

export async function registerGuest(
  token: string,
  body: RegisterGuestRequest,
): Promise<{ guestId: number; nickname: string; videoId: number }> {
  return request({ method: 'POST', url: paths.shareLinks.guests(token), data: body })
}

export async function deactivateShareLink(shareLinkId: number): Promise<ShareLink> {
  return request({ method: 'PATCH', url: paths.shareLinks.byId(shareLinkId) })
}
