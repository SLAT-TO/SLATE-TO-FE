import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteVideo, getVideo, updateVideo, updateVideoBookmark } from '../api/videos'
import type { VideoDetail, VideoProgressStatus } from '../types/video'

/** 영상 상세 데이터 로딩 + 북마크·진행 상태·수정·삭제를 다루는 훅.
 * 로딩/에러는 호출부(부모)가 다른 병렬 로딩과 함께 묶어서 관리하므로 load()는 실패 시 그대로 던진다. */
export function useVideoDetail(projectId: number, videoId: number, onDeleted: () => void) {
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statusMenuOpen) return
    const handlePointerDown = (e: PointerEvent) => {
      if (!statusMenuRef.current?.contains(e.target as Node)) setStatusMenuOpen(false)
    }
    // 유튜브 iframe 클릭은 별도 document라 pointerdown이 감지되지 않아 window blur로 보조 감지
    const handleWindowBlur = () => setStatusMenuOpen(false)
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('blur', handleWindowBlur)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [statusMenuOpen])

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

  /** 영상 진행 상태 변경 — 백엔드에 상태 변경 API가 없어 로컬 상태만 갱신 (API 연동 전, 최근 활동 체크박스와 동일한 방식) */
  const changeVideoStatus = useCallback((status: VideoProgressStatus) => {
    setStatusMenuOpen(false)
    setVideoDetail((prev) => (prev ? { ...prev, progressStatus: status } : prev))
  }, [])

  const confirmDeleteVideo = useCallback(async () => {
    await deleteVideo(projectId, videoId)
    onDeleted()
  }, [projectId, videoId, onDeleted])

  const handleUpdateVideo = useCallback(
    async (values: { title: string; memo?: string }) => {
      const result = await updateVideo(projectId, videoId, values)
      setVideoDetail((prev) =>
        prev
          ? { ...prev, title: result.title, memo: result.memo, updatedAt: result.updatedAt }
          : prev,
      )
    },
    [projectId, videoId],
  )

  return {
    videoDetail,
    load,
    statusMenuOpen,
    setStatusMenuOpen,
    statusMenuRef,
    toggleBookmark,
    changeVideoStatus,
    confirmDeleteVideo,
    handleUpdateVideo,
  }
}
