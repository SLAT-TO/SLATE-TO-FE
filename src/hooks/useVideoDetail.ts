import { useCallback, useState } from 'react'
import { deleteVideo, getVideo, updateVideo, updateVideoBookmark } from '../api/videos'
import type { VideoDetail } from '../types/video'

/** 영상 상세 데이터 로딩 + 북마크·진행 상태·수정·삭제를 다루는 훅.
 * 로딩/에러는 호출부(부모)가 다른 병렬 로딩과 함께 묶어서 관리하므로 load()는 실패 시 그대로 던진다. */
export function useVideoDetail(projectId: number, videoId: number, onDeleted: () => void) {
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null)
  const load = useCallback(async () => {
    const detail = await getVideo(projectId, videoId)
    setVideoDetail(detail)
    return detail
  }, [projectId, videoId])

  const toggleBookmark = useCallback(async () => {
    setVideoDetail((prev) => {
      if (!prev) return prev
      const next = !prev.bookmarked
      void updateVideoBookmark(projectId, videoId, { bookmarked: next }).catch(() => {
        setVideoDetail((p) => (p ? { ...p, bookmarked: !next } : p))
      })
      return { ...prev, bookmarked: next }
    })
  }, [projectId, videoId])

  const confirmDeleteVideo = useCallback(async () => {
    await deleteVideo(projectId, videoId)
    onDeleted()
  }, [projectId, videoId, onDeleted])

  const handleUpdateVideo = useCallback(
    async (values: { title: string; memo?: string; youtubeUrl?: string }) => {
      const result = await updateVideo(projectId, videoId, values)
      setVideoDetail((prev) =>
        prev
          ? {
              ...prev,
              title: result.title,
              memo: result.memo,
              updatedAt: result.updatedAt,
              youtubeUrl: result.youtubeUrl ?? prev.youtubeUrl,
            }
          : prev,
      )
    },
    [projectId, videoId],
  )

  return {
    videoDetail,
    load,
    toggleBookmark,
    confirmDeleteVideo,
    handleUpdateVideo,
  }
}
