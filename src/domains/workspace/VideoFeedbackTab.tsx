import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createFeedback,
  createReply,
  deleteFeedback,
  deleteVideo,
  getFeedbacks,
  getReferenceFiles,
  getReplies,
  getVideo,
  getVideos,
  linkReferenceFile,
  unlinkReferenceFile,
  updateFeedbackStatus,
  updateVideoBookmark,
} from '../../api/videos'
import {
  createInvitation,
  getDownloadUrl,
  getProjectFiles,
  getProjectMembers,
} from '../../api/projects'
import { getMe } from '../../api/users'
import ActionMenu from '../../components/ActionMenu'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import InlineIcon from '../../components/InlineIcon'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import YouTubeIframePlayer from '../../components/YouTubeIframePlayer'
import VideoCard from './VideoCard'
import { useHeaderSlot } from '../../hooks/useHeaderSlot'
import { CARD_BASE } from '../../styles/card'
import type { VideoDetail, VideoListItem, VideoProgressStatus } from '../../types/video'
import type { Feedback, FeedbackReply } from '../../types/feedback'
import type { ReferenceFile } from '../../types/video'
import type { ProjectFileListItem } from '../../types/file'
import type { MemberSummary, ProjectLengthType } from '../../types/project'
import { PROJECT_LENGTH_TYPE_LABEL } from '../../constants/projectLabels'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import clockIcon from '../../assets/icons/clock.svg?raw'
import commentCheckIcon from '../../assets/icons/comment-check.svg?raw'
import documentIcon from '../../assets/icons/document.svg?raw'
import downloadIcon from '../../assets/icons/download.svg?raw'
import paperPlaneIcon from '../../assets/icons/paper-plane.svg?raw'
import searchIcon from '../../assets/icons/search.svg?raw'
import starIcon from '../../assets/icons/star.svg?raw'
import xIcon from '../../assets/icons/x.svg?raw'

type VideoFeedbackTabProps = {
  projectId: number
}

type FeedbackFilter = 'all' | 'unresolved'

function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}
function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M3 10v4h4l5 5V5L7 10H3zm12.59 2L18 9.59 19.41 11 17 13.41 19.41 15.83 18 17.24 15.59 14.83 13.17 17.24 11.76 15.83 14.17 13.41 11.76 11 13.17 9.59z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
    </svg>
  )
}
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  )
}

function formatFeedbackTime(feedback: Pick<Feedback, 'startTime' | 'endTime'>): string {
  if (feedback.startTime === null) return ''
  if (feedback.endTime === null) return formatTimestamp(feedback.startTime)
  return `${formatTimestamp(feedback.startTime)} ~ ${formatTimestamp(feedback.endTime)}`
}

/** 피드백/답글에 첨부된 시간 표시 — 구간이면 시작/종료 지점을 각각 클릭해 그 지점으로 이동할 수 있게 분리 */
function FeedbackTimeLink({
  feedback,
  onSeek,
  className,
}: {
  feedback: Pick<Feedback, 'startTime' | 'endTime'>
  onSeek: (seconds: number) => void
  className: string
}) {
  if (feedback.startTime === null) return null
  if (feedback.endTime === null) {
    return (
      <button type="button" onClick={() => onSeek(feedback.startTime!)} className={className}>
        {formatTimestamp(feedback.startTime)}
      </button>
    )
  }
  return (
    <span className={className}>
      <button type="button" onClick={() => onSeek(feedback.startTime!)}>
        {formatTimestamp(feedback.startTime)}
      </button>
      {' ~ '}
      <button type="button" onClick={() => onSeek(feedback.endTime!)}>
        {formatTimestamp(feedback.endTime)}
      </button>
    </span>
  )
}

/** 작성 중인 피드백/답글에 첨부된(아직 전송 전) 시간 — 없으면 null */
function formatPendingTime(start: number | null, end: number | null): string | null {
  if (end !== null) return formatFeedbackTime({ startTime: start, endTime: end })
  if (start !== null) return formatTimestamp(start)
  return null
}

type VideoFeedbackTabWithSelectionProps = VideoFeedbackTabProps & {
  onSelectVideo: (videoId: number) => void
}

export default function VideoFeedbackTab({
  projectId,
  onSelectVideo,
}: VideoFeedbackTabWithSelectionProps) {
  const [videos, setVideos] = useState<VideoListItem[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<VideoListItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setVideosLoading(true)
      try {
        const result = await getVideos(projectId)
        if (!cancelled) setVideos(result.items)
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
    } catch {
      setDeleteError('영상을 삭제하지 못했습니다. 다시 시도해주세요.')
      setDeleteTarget(null)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      {deleteError && <p className="text-caption-lg text-warning">{deleteError}</p>}
      {videosLoading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}
      {!videosLoading && videos.length === 0 && (
        <p className="text-caption-lg text-neutral-6">등록된 영상이 없습니다.</p>
      )}
      {!videosLoading && videos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard
              key={video.videoId}
              title={video.title}
              thumbnailUrl={video.thumbnailUrl}
              progressStatus={video.progressStatus}
              relativeTime={formatDistanceToNow(new Date(video.updatedAt), {
                addSuffix: true,
                locale: ko,
              })}
              unreadCommentCount={video.unreadCommentCount}
              onClick={() => onSelectVideo(video.videoId)}
              onDelete={() => setDeleteTarget(video)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteVideo}
        title="영상을 삭제할까요?"
        description={deleteTarget?.title}
        confirmText="삭제하기"
      />
    </section>
  )
}

export type VideoDetailViewProps = {
  projectId: number
  videoId: number
  meId: number | null
  lengthType: ProjectLengthType | null
  onBack: () => void
}

export function VideoDetailView({
  projectId,
  videoId,
  meId,
  lengthType,
  onBack,
}: VideoDetailViewProps) {
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null)
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FeedbackFilter>('all')
  const [newFeedback, setNewFeedback] = useState('')
  const [pendingStart, setPendingStart] = useState<number | null>(null)
  const [pendingEnd, setPendingEnd] = useState<number | null>(null)
  /** 구간 기록 버튼으로 시작점만 찍고 종료점 대기 중인 상태 */
  const [isCapturingRange, setIsCapturingRange] = useState(false)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null)
  const [repliesByFeedback, setRepliesByFeedback] = useState<Record<number, FeedbackReply[]>>({})
  const [newReply, setNewReply] = useState('')
  const [replyPendingStart, setReplyPendingStart] = useState<number | null>(null)
  const [replyPendingEnd, setReplyPendingEnd] = useState<number | null>(null)
  /** 답글의 구간 기록 버튼으로 시작점만 찍고 종료점 대기 중인 상태 */
  const [isCapturingReplyRange, setIsCapturingReplyRange] = useState(false)
  const [fileSearch, setFileSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFileListItem[]>([])
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [inviteCopied, setInviteCopied] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  const playerRef = useRef<YT.Player | null>(null)
  const playerWrapperRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

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

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [detail, refFiles, feedbackPage, memberList] = await Promise.all([
          getVideo(projectId, videoId),
          getReferenceFiles(videoId),
          getFeedbacks(videoId),
          getProjectMembers(projectId).catch(() => ({
            items: [] as MemberSummary[],
            memberCount: 0,
          })),
        ])
        if (cancelled) return
        setVideoDetail(detail)
        setReferenceFiles(refFiles.items)
        setFeedbacks(feedbackPage.items)
        setMembers(memberList.items)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId, videoId])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const p = playerRef.current
      if (p) setCurrentTime(p.getCurrentTime())
    }, 250)
    return () => clearInterval(id)
  }, [isPlaying])

  const handlePlayerReady = (player: YT.Player) => {
    playerRef.current = player
    setDuration(player.getDuration())
  }

  const toggleBookmark = useCallback(async () => {
    if (!videoDetail) return
    const next = !videoDetail.bookmarked
    setVideoDetail({ ...videoDetail, bookmarked: next })
    try {
      await updateVideoBookmark(projectId, videoId, { bookmarked: next })
    } catch {
      setVideoDetail((prev) => (prev ? { ...prev, bookmarked: !next } : prev))
    }
  }, [videoDetail, projectId, videoId])

  /** 영상 진행 상태 변경 — 백엔드에 상태 변경 API가 없어 로컬 상태만 갱신 (API 연동 전, 최근 활동 체크박스와 동일한 방식) */
  const changeVideoStatus = useCallback((status: VideoProgressStatus) => {
    setStatusMenuOpen(false)
    setVideoDetail((prev) => (prev ? { ...prev, progressStatus: status } : prev))
  }, [])

  /** 참여 인원 초대 — BE가 내려준 inviteUrl을 클립보드에 복사 */
  const inviteMember = useCallback(async () => {
    const { inviteUrl } = await createInvitation(projectId)
    await navigator.clipboard.writeText(inviteUrl)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 2000)
  }, [projectId])

  const confirmDeleteVideo = useCallback(async () => {
    await deleteVideo(projectId, videoId)
    onBack()
  }, [projectId, videoId, onBack])

  const handleStateChange = (event: YT.PlayerStateChangeEvent) => {
    setIsPlaying(event.data === 1)
    const d = playerRef.current?.getDuration()
    if (d) setDuration(d)
  }

  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    if (isPlaying) p.pauseVideo()
    else p.playVideo()
  }

  const toggleMute = () => {
    const p = playerRef.current
    if (!p) return
    if (isMuted) {
      p.unMute()
      setIsMuted(false)
    } else {
      p.mute()
      setIsMuted(true)
    }
  }

  /** 플레이어 탐색 + 진행바/시간 표시 상태를 함께 갱신 — 둘 중 하나만 하면 화면이 실제 재생 위치와 어긋남 */
  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
    setCurrentTime(seconds)
  }, [])

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    seekTo(fraction * duration)
  }

  const clearPendingTime = () => {
    setPendingStart(null)
    setPendingEnd(null)
    setIsCapturingRange(false)
  }

  const attachCurrentTime = () => {
    setPendingStart(Math.floor(currentTime))
    setPendingEnd(null)
    setIsCapturingRange(false)
  }

  /** 구간 기록 버튼 — 첫 클릭은 시작점, 재생 위치를 옮긴 뒤 두 번째 클릭은 종료점 */
  const toggleRangeCapture = () => {
    if (!isCapturingRange) {
      setPendingStart(Math.floor(currentTime))
      setPendingEnd(null)
      setIsCapturingRange(true)
    } else {
      setPendingEnd(Math.floor(currentTime))
      setIsCapturingRange(false)
    }
  }

  const submitFeedback = async () => {
    if (!newFeedback.trim()) return
    const created = await createFeedback(videoId, {
      content: newFeedback.trim(),
      startTime: pendingStart ?? undefined,
      endTime: pendingEnd ?? undefined,
    })
    setFeedbacks((prev) => [created, ...prev])
    setNewFeedback('')
    clearPendingTime()
  }

  const toggleResolved = async (feedback: Feedback) => {
    const me = await getMe()
    const updated = await updateFeedbackStatus(feedback.feedbackId, {
      userId: me.id,
      status: !feedback.status,
    })
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.feedbackId === updated.feedbackId
          ? { ...f, status: updated.status, updatedAt: updated.updatedAt }
          : f,
      ),
    )
  }

  const removeFeedback = async (feedbackId: number) => {
    await deleteFeedback(feedbackId)
    setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== feedbackId))
  }

  const clearReplyPendingTime = () => {
    setReplyPendingStart(null)
    setReplyPendingEnd(null)
    setIsCapturingReplyRange(false)
  }

  /** 답글 입력창을 다른 피드백으로 옮기거나 닫을 때 이전에 쓰던 텍스트·시간 첨부 상태가 남지 않도록 초기화 */
  const resetReplyCompose = () => {
    setNewReply('')
    clearReplyPendingTime()
  }

  const toggleReplies = async (feedbackId: number) => {
    if (expandedFeedbackId === feedbackId) {
      setExpandedFeedbackId(null)
      resetReplyCompose()
      return
    }
    setExpandedFeedbackId(feedbackId)
    resetReplyCompose()
    if (!repliesByFeedback[feedbackId]) {
      const page = await getReplies(feedbackId)
      setRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: page.items }))
    }
  }

  const attachReplyCurrentTime = () => {
    setReplyPendingStart(Math.floor(currentTime))
    setReplyPendingEnd(null)
    setIsCapturingReplyRange(false)
  }

  /** 답글 구간 기록 버튼 — 첫 클릭은 시작점, 재생 위치를 옮긴 뒤 두 번째 클릭은 종료점 */
  const toggleReplyRangeCapture = () => {
    if (!isCapturingReplyRange) {
      setReplyPendingStart(Math.floor(currentTime))
      setReplyPendingEnd(null)
      setIsCapturingReplyRange(true)
    } else {
      setReplyPendingEnd(Math.floor(currentTime))
      setIsCapturingReplyRange(false)
    }
  }

  const submitReply = async (feedbackId: number) => {
    if (!newReply.trim()) return
    const created = await createReply(feedbackId, {
      content: newReply.trim(),
      startTime: replyPendingStart ?? undefined,
      endTime: replyPendingEnd ?? undefined,
    })
    setRepliesByFeedback((prev) => ({
      ...prev,
      [feedbackId]: [...(prev[feedbackId] ?? []), created],
    }))
    resetReplyCompose()
  }

  const openPicker = async () => {
    setPickerOpen(true)
    if (projectFiles.length === 0) {
      const page = await getProjectFiles(projectId)
      setProjectFiles(page.items)
    }
  }

  const attachFile = async (projectFileId: number) => {
    const linked = await linkReferenceFile(videoId, projectFileId)
    setReferenceFiles((prev) => [...prev, linked])
    setPickerOpen(false)
  }

  const removeReferenceFile = async (referenceFileId: number) => {
    await unlinkReferenceFile(videoId, referenceFileId)
    setReferenceFiles((prev) => prev.filter((f) => f.referenceFileId !== referenceFileId))
  }

  const downloadReferenceFile = async (projectFileId: number) => {
    const { downloadUrl } = await getDownloadUrl(projectId, projectFileId)
    window.open(downloadUrl, '_blank', 'noopener')
  }

  const filteredFeedbacks = feedbacks.filter((f) => (filter === 'unresolved' ? !f.status : true))
  const filteredFiles = referenceFiles.filter((f) =>
    f.fileName.toLowerCase().includes(fileSearch.toLowerCase()),
  )

  /** 전역 헤더 한 줄에 제목·북마크·상태·참여 인원(왼쪽, 대시보드와 동일 배치)과 초대 버튼·ActionMenu(오른쪽)를 채운다. */
  const headerLeftContent = useMemo(() => {
    if (!videoDetail) return null
    return (
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-head-sm text-neutral-11 font-bold">{videoDetail.title}</h1>
          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={videoDetail.bookmarked ? '북마크 해제' : '북마크'}
            className={videoDetail.bookmarked ? 'text-caution' : 'text-neutral-4'}
          >
            <InlineIcon svg={starIcon} className="size-4" />
          </button>
          {/* 영상 진행 상태 변경 API가 없어 로컬 상태만 갱신 (changeVideoStatus 주석 참고) */}
          <div className="relative" ref={statusMenuRef}>
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              className="bg-neutral-3 text-neutral-5 text-caption-sm flex items-center gap-1 rounded-[3px] px-[19px] py-1 font-semibold"
            >
              {videoDetail.progressStatus === 'DONE' ? '완료' : '진행중'}
              <InlineIcon svg={chevronDownIcon} className="size-3" />
            </button>
            {statusMenuOpen && (
              <ul className="border-neutral-3 bg-bg-primary absolute top-full left-0 z-10 mt-1 w-24 rounded-lg border py-1 shadow-md">
                {(['IN_PROGRESS', 'DONE'] as const).map((status) => (
                  <li key={status}>
                    <button
                      type="button"
                      onClick={() => changeVideoStatus(status)}
                      className="hover:bg-neutral-2 text-caption-lg text-neutral-10 block w-full px-3 py-2 text-left"
                    >
                      {status === 'DONE' ? '완료' : '진행중'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-caption-lg text-neutral-11 font-semibold">참여 인원</span>
          {members.length > 0 && (
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member) => (
                <Avatar
                  key={member.memberId}
                  src={member.profileImageUrl ?? undefined}
                  alt={member.nickname}
                  size={28}
                  fallback={member.nickname.slice(0, 1)}
                  border="gray"
                  className="bg-neutral-2"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }, [videoDetail, toggleBookmark, statusMenuOpen, changeVideoStatus, members])

  const headerRightContent = useMemo(() => {
    if (!videoDetail) return null
    return (
      <div className="flex items-center gap-4">
        <ActionMenu
          items={[{ action: 'delete', onClick: () => setDeleteOpen(true) }]}
          ariaLabel="영상 메뉴"
        />
        <Button variant="primary" size="sm" onClick={inviteMember}>
          {inviteCopied ? '링크 복사됨' : '+ 초대'}
        </Button>
      </div>
    )
  }, [videoDetail, inviteMember, inviteCopied])

  useHeaderSlot(headerLeftContent, headerRightContent)

  if (loading || !videoDetail) {
    return <p className="text-body-sm text-neutral-6">불러오는 중…</p>
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-caption-lg text-neutral-6">
          생성일 {formatDate(videoDetail.createdAt)}
        </span>
        <span className="text-caption-lg text-neutral-6">
          수정일 {formatDate(videoDetail.updatedAt)}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div
            ref={playerWrapperRef}
            className="group relative w-full overflow-hidden rounded-[10px] bg-black"
            style={{ aspectRatio: '752 / 360' }}
          >
            <YouTubeIframePlayer
              videoIdOrUrl={videoDetail.youtubeUrl}
              title={videoDetail.title}
              hideControls
              onReady={handlePlayerReady}
              onStateChange={handleStateChange}
              className="h-full max-w-none"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
              <div
                onClick={handleSeekClick}
                className="h-1 w-full cursor-pointer rounded-full bg-white/30"
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex items-center gap-3 text-white">
                <button type="button" onClick={togglePlay} className="shrink-0">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button type="button" onClick={toggleMute} className="shrink-0">
                  <VolumeIcon muted={isMuted} />
                </button>
                <span className="text-caption-sm rounded-full bg-black/40 px-3 py-1">
                  {formatTimestamp(currentTime)}/{formatTimestamp(duration)}
                </span>
                <button
                  type="button"
                  onClick={() => playerWrapperRef.current?.requestFullscreen?.()}
                  className="ml-auto shrink-0"
                >
                  <ExpandIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-head-sm text-neutral-9 font-semibold">프로젝트 소개글</h2>
            {(videoDetail.projectTags.length > 0 || lengthType) && (
              <div className="flex flex-wrap gap-2">
                {videoDetail.projectTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-tag-role-bg text-tag-role-text text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
                  >
                    {tag}
                  </span>
                ))}
                {lengthType && (
                  <span className="bg-tag-role-bg text-tag-role-text text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold">
                    {PROJECT_LENGTH_TYPE_LABEL[lengthType] ?? lengthType}
                  </span>
                )}
              </div>
            )}
            <div className="bg-neutral-2 border-neutral-3 text-body-sm text-neutral-5 rounded-lg border px-4 py-3">
              {videoDetail.memo || '영상에 관련된 메모가 없습니다.'}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-body-sm text-neutral-11 font-semibold">참고 파일</h2>
            <div className="bg-neutral-2 border-neutral-3 flex items-center gap-2 rounded-lg border px-4 py-3">
              <input
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="text-body-sm text-neutral-11 placeholder:text-neutral-5 flex-1 bg-transparent outline-none"
              />
              <InlineIcon svg={searchIcon} className="text-neutral-9 size-5" />
            </div>
            {filteredFiles.length === 0 && (
              <p className="text-caption-lg text-neutral-6">참고 파일이 없습니다.</p>
            )}
            {filteredFiles.map((file) => (
              <div
                key={file.referenceFileId}
                className="bg-bg-primary border-neutral-5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
                  <span className="text-body-sm text-neutral-11 truncate">{file.fileName}</span>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-caption-lg text-neutral-6">
                    {formatDate(file.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadReferenceFile(file.projectFileId)}
                    aria-label="다운로드"
                    className="text-neutral-9 hover:text-primary"
                  >
                    <InlineIcon svg={downloadIcon} className="size-4" />
                  </button>
                  <ActionMenu
                    items={[
                      {
                        action: 'delete',
                        onClick: () => removeReferenceFile(file.referenceFileId),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={openPicker}
              className="border-primary text-primary hover:bg-primary/5 text-body-sm w-full rounded-lg border py-2 font-semibold"
            >
              파일 추가하기
            </button>
          </div>
        </div>

        <div
          className={`flex min-h-[144px] w-full flex-col gap-4 ${CARD_BASE} p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-140px)] lg:w-[300px] lg:shrink-0`}
        >
          <div className="flex shrink-0 items-center justify-between">
            <h2 className="text-head-sm text-neutral-11 font-semibold">피드백</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`text-caption-sm h-6 w-[72px] rounded-[3px] font-semibold ${
                  filter === 'all'
                    ? 'bg-tag-active-bg text-tag-active-text'
                    : 'bg-tag-done-bg text-tag-done-text'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setFilter('unresolved')}
                className={`text-caption-sm h-6 w-[72px] rounded-[3px] font-semibold ${
                  filter === 'unresolved'
                    ? 'bg-tag-active-bg text-tag-active-text'
                    : 'bg-tag-done-bg text-tag-done-text'
                }`}
              >
                해결 안됨
              </button>
            </div>
          </div>

          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {filteredFeedbacks.map((feedback) => {
              const isMine =
                meId !== null && feedback.actor.type === 'USER' && feedback.actor.id === meId
              const isResolved = feedback.status
              return (
                <li
                  key={feedback.feedbackId}
                  className="border-neutral-3 flex flex-col gap-2 border-b pb-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar
                        alt={feedback.actor.name}
                        size={22}
                        fallback={feedback.actor.name.slice(0, 1)}
                      />
                      <FeedbackTimeLink
                        feedback={feedback}
                        onSeek={seekTo}
                        className="text-caption-sm text-primary font-bold underline"
                      />
                      <span className="text-caption-sm text-neutral-9 font-medium">
                        {feedback.actor.name}
                      </span>
                      <span
                        className={`size-[9px] rounded-full ${isResolved ? 'bg-success' : 'bg-warning'}`}
                        aria-hidden
                      />
                    </div>
                    {isMine && (
                      <ActionMenu
                        items={[
                          { action: 'delete', onClick: () => removeFeedback(feedback.feedbackId) },
                        ]}
                      />
                    )}
                  </div>

                  <p className="text-caption-lg text-neutral-10">{feedback.content}</p>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleReplies(feedback.feedbackId)}
                      className="text-caption-sm text-neutral-9 flex items-center gap-1 font-semibold"
                    >
                      답글
                      {repliesByFeedback[feedback.feedbackId]?.length
                        ? ` ${repliesByFeedback[feedback.feedbackId].length}`
                        : ''}
                      <InlineIcon
                        svg={chevronDownIcon}
                        className={`size-4 transition-transform ${expandedFeedbackId === feedback.feedbackId ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleResolved(feedback)}
                      aria-pressed={isResolved}
                      aria-label="해결 처리"
                      className={isResolved ? 'text-success' : 'text-neutral-5'}
                    >
                      <InlineIcon svg={commentCheckIcon} className="size-4" />
                    </button>
                  </div>

                  {expandedFeedbackId === feedback.feedbackId && (
                    <div className="flex flex-col gap-2 pl-2">
                      {(repliesByFeedback[feedback.feedbackId] ?? []).map((reply) => (
                        <div key={reply.replyId} className="flex items-start gap-2">
                          <Avatar
                            alt={reply.actor.name}
                            size={18}
                            fallback={reply.actor.name.slice(0, 1)}
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-caption-sm text-neutral-9 font-semibold">
                                {reply.actor.name}
                              </span>
                              <FeedbackTimeLink
                                feedback={reply}
                                onSeek={seekTo}
                                className="text-caption-sm text-primary font-bold underline"
                              />
                            </div>
                            <span className="text-caption-lg text-neutral-10">{reply.content}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={attachReplyCurrentTime}
                            aria-label="현재 위치 기록"
                            className={`border-neutral-5 flex items-center justify-center rounded-lg border p-1 ${
                              replyPendingStart !== null &&
                              replyPendingEnd === null &&
                              !isCapturingReplyRange
                                ? 'border-primary text-primary'
                                : 'text-neutral-9'
                            }`}
                          >
                            <InlineIcon svg={clockIcon} className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={toggleReplyRangeCapture}
                            aria-label="구간 기록"
                            title={isCapturingReplyRange ? '종료 지점 기록' : '구간 기록'}
                            className={`border-neutral-5 flex items-center rounded-lg border p-1 ${
                              isCapturingReplyRange || replyPendingEnd !== null
                                ? 'border-primary text-primary'
                                : 'text-neutral-9'
                            }`}
                          >
                            <InlineIcon svg={clockIcon} className="size-4" />
                            <span aria-hidden className="mx-0.5 h-0.5 w-2 bg-current" />
                            <InlineIcon svg={clockIcon} className="size-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="border-neutral-3 focus-within:border-primary flex flex-1 items-center gap-2 rounded-md border px-2 py-1">
                            {formatPendingTime(replyPendingStart, replyPendingEnd) && (
                              <span className="text-caption-sm text-primary flex shrink-0 items-center gap-1 font-bold">
                                {formatPendingTime(replyPendingStart, replyPendingEnd)}
                                <button
                                  type="button"
                                  onClick={clearReplyPendingTime}
                                  aria-label="시간 첨부 취소"
                                  className="text-neutral-5 hover:text-neutral-7"
                                >
                                  <InlineIcon svg={xIcon} className="size-3" />
                                </button>
                              </span>
                            )}
                            <input
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              placeholder="답글 남기기"
                              className="text-caption-lg min-w-0 flex-1 outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => submitReply(feedback.feedbackId)}
                            disabled={!newReply.trim()}
                            className="text-primary disabled:text-neutral-4 text-caption-sm font-semibold"
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="border-neutral-5 flex shrink-0 flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={attachCurrentTime}
                aria-label="현재 위치 기록"
                className={`border-neutral-5 flex items-center justify-center rounded-lg border p-2 ${
                  pendingStart !== null && pendingEnd === null && !isCapturingRange
                    ? 'border-primary text-primary'
                    : 'text-neutral-9'
                }`}
              >
                <InlineIcon svg={clockIcon} className="size-5" />
              </button>
              <button
                type="button"
                onClick={toggleRangeCapture}
                aria-label="구간 기록"
                title={isCapturingRange ? '종료 지점 기록' : '구간 기록'}
                className={`border-neutral-5 flex items-center rounded-lg border p-2 ${
                  isCapturingRange || pendingEnd !== null
                    ? 'border-primary text-primary'
                    : 'text-neutral-9'
                }`}
              >
                <InlineIcon svg={clockIcon} className="size-5" />
                <span aria-hidden className="mx-0.5 h-0.5 w-3 bg-current" />
                <InlineIcon svg={clockIcon} className="size-5" />
              </button>
            </div>
            <div className="relative">
              {formatPendingTime(pendingStart, pendingEnd) && (
                <span className="text-caption-lg text-primary absolute top-2 left-3 z-10 flex items-center gap-1 font-bold">
                  {formatPendingTime(pendingStart, pendingEnd)}
                  <button
                    type="button"
                    onClick={clearPendingTime}
                    aria-label="시간 첨부 취소"
                    className="text-neutral-5 hover:text-neutral-7"
                  >
                    <InlineIcon svg={xIcon} className="size-3.5" />
                  </button>
                </span>
              )}
              <TextArea
                value={newFeedback}
                onChange={setNewFeedback}
                placeholder="피드백을 입력하세요"
                rows={3}
                className={formatPendingTime(pendingStart, pendingEnd) ? 'pt-8' : ''}
              />
            </div>
            <button
              type="button"
              onClick={submitFeedback}
              disabled={!newFeedback.trim()}
              className="bg-primary disabled:bg-neutral-3 flex size-7 items-center justify-center self-end rounded-full text-white"
              aria-label="전송"
            >
              <InlineIcon svg={paperPlaneIcon} className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)}>
        <div className="bg-bg-primary flex w-[420px] flex-col gap-3 rounded-lg p-5">
          <h3 className="text-body-sm text-neutral-11 font-semibold">
            참고 파일로 연결할 파일 선택
          </h3>
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {projectFiles.map((file) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => attachFile(file.id)}
                  className="hover:bg-neutral-2 text-body-sm text-neutral-10 w-full rounded-md px-3 py-2 text-left"
                >
                  {file.fileName}
                </button>
              </li>
            ))}
            {projectFiles.length === 0 && (
              <p className="text-caption-lg text-neutral-6">
                연결할 수 있는 프로젝트 파일이 없습니다.
              </p>
            )}
          </ul>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteVideo}
        title="영상을 삭제할까요?"
        description="삭제한 영상은 복구할 수 없습니다."
      />
    </section>
  )
}
