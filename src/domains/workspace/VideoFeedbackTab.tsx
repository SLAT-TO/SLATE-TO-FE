import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  createVideo,
  deleteVideo,
  getVideo,
  getVideos,
  updateVideo,
  updateVideoBookmark,
} from '../../api/videos'
import ConfirmModal from '../../components/ConfirmModal'
import VideoCard from './VideoCard'
import AddVideoModal from './AddVideoModal'
import EditVideoModal from './EditVideoModal'
import type { VideoListItem } from '../../types/video'
import type { CreateVideoValues } from '../../schemas/video'
import { invalidateProjectActivityData } from '../../queries/projectInvalidation'
import { projectStatusLabel } from '../../constants/projectStatus'
import type { ProjectStatus } from '../../types/project'

/** 북마크한 영상을 목록 상단으로 */
function sortVideosByBookmark(items: VideoListItem[]): VideoListItem[] {
  return [...items].sort((a, b) => {
    if (a.bookmarked !== b.bookmarked) return a.bookmarked ? -1 : 1
    return b.videoId - a.videoId
  })
}

type EditTarget = {
  videoId: number
  title: string
  youtubeUrl: string
  memo: string | null
}

type VideoFeedbackTabProps = {
  projectId: number
  projectStatus: ProjectStatus
}

export default function VideoFeedbackTab({ projectId, projectStatus }: VideoFeedbackTabProps) {
  const queryClient = useQueryClient()
  const [videos, setVideos] = useState<VideoListItem[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<VideoListItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [addVideoOpen, setAddVideoOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)

  const refreshProjectData = () => {
    void invalidateProjectActivityData(queryClient, projectId)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setVideosLoading(true)
      try {
        const result = await getVideos(projectId)
        if (!cancelled) setVideos(sortVideosByBookmark(result.items))
      } finally {
        if (!cancelled) setVideosLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const confirmDeleteVideo = async () => {
    if (!deleteTarget) return
    setDeleteError(null)
    try {
      await deleteVideo(projectId, deleteTarget.videoId)
      setVideos((prev) => prev.filter((v) => v.videoId !== deleteTarget.videoId))
      setDeleteTarget(null)
      refreshProjectData()
    } catch {
      setDeleteError('영상을 삭제하지 못했습니다. 다시 시도해주세요.')
      setDeleteTarget(null)
    }
  }

  const handleCreateVideo = async (values: CreateVideoValues) => {
    const result = await createVideo(projectId, values)
    setVideos((prev) =>
      sortVideosByBookmark([
        {
          videoId: result.videoId,
          title: result.title,
          thumbnailUrl: result.thumbnailUrl,
          bookmarked: result.bookmarked,
          progressStatus: result.progressStatus,
          hasUnreadFeedback: false,
          createdAt: result.createdAt,
          updatedAt: result.createdAt,
        },
        ...prev,
      ]),
    )
    refreshProjectData()
  }

  const handleToggleBookmark = async (video: VideoListItem) => {
    const next = !video.bookmarked
    setVideos((prev) =>
      sortVideosByBookmark(
        prev.map((v) => (v.videoId === video.videoId ? { ...v, bookmarked: next } : v)),
      ),
    )
    try {
      await updateVideoBookmark(projectId, video.videoId, { bookmarked: next })
    } catch {
      setVideos((prev) =>
        sortVideosByBookmark(
          prev.map((v) => (v.videoId === video.videoId ? { ...v, bookmarked: !next } : v)),
        ),
      )
    }
  }

  const openEdit = async (video: VideoListItem) => {
    setEditError(null)
    try {
      const detail = await getVideo(projectId, video.videoId)
      setEditTarget({
        videoId: detail.videoId,
        title: detail.title,
        youtubeUrl: detail.youtubeUrl,
        memo: detail.memo,
      })
    } catch {
      setEditError('영상 정보를 불러오지 못했습니다. 다시 시도해주세요.')
    }
  }

  const handleUpdateVideo = async (values: { title: string; memo?: string }) => {
    if (!editTarget) return
    const result = await updateVideo(projectId, editTarget.videoId, values)
    setVideos((prev) =>
      prev.map((v) =>
        v.videoId === result.videoId
          ? { ...v, title: result.title, updatedAt: result.updatedAt }
          : v,
      ),
    )
    refreshProjectData()
  }

  return (
    <section className="flex flex-col gap-3">
      {deleteError && <p className="text-caption-lg text-warning">{deleteError}</p>}
      {editError && <p className="text-caption-lg text-warning">{editError}</p>}
      {videosLoading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}
      {!videosLoading && (
        <>
          <h2 className="text-body-lg text-neutral-11 font-bold">영상 목록</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video.videoId}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                statusLabel={projectStatusLabel(projectStatus)}
                statusVariant={projectStatus === 'COMPLETED' ? 'ghost' : 'secondary'}
                hasUnreadFeedback={video.hasUnreadFeedback}
                bookmarked={video.bookmarked}
                onToggleBookmark={() => void handleToggleBookmark(video)}
                to={`/workspace/projects/${projectId}/videos/${video.videoId}`}
                onEdit={() => void openEdit(video)}
                onDelete={() => setDeleteTarget(video)}
              />
            ))}
            <button
              type="button"
              onClick={() => setAddVideoOpen(true)}
              className="bg-neutral-3 hover:bg-neutral-9 text-neutral-5 flex w-full flex-col gap-3 rounded-[10px] p-4 transition-colors"
            >
              {/* VideoCard와 동일한 3단(제목행 · aspect-video · 하단행) 골격으로 높이만 맞추고, 카드 전체를 하나의 배경색으로 채움 */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-body-sm invisible font-semibold">-</span>
              </div>

              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2">
                <span className="text-head-sm font-bold">+</span>
                <span className="text-caption-lg font-semibold">새로운 영상 추가</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="h-6" />
              </div>
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteVideo}
        title="영상을 삭제할까요?"
        description={deleteTarget?.title}
        confirmText="삭제하기"
      />

      <AddVideoModal
        projectId={projectId}
        isOpen={addVideoOpen}
        onClose={() => setAddVideoOpen(false)}
        onCreated={handleCreateVideo}
      />

      <EditVideoModal
        key={editTarget ? `video-${editTarget.videoId}` : 'video-edit-closed'}
        isOpen={editTarget !== null}
        initialTitle={editTarget?.title ?? ''}
        initialYoutubeUrl={editTarget?.youtubeUrl ?? ''}
        initialMemo={editTarget?.memo ?? ''}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdateVideo}
      />
    </section>
  )
}
