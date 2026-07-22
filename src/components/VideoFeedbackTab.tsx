import { useEffect, useRef, useState } from 'react'
import {
  createFeedback,
  createReply,
  deleteFeedback,
  getFeedbacks,
  getReferenceFiles,
  getReplies,
  getVideo,
  getVideos,
  linkReferenceFile,
  updateFeedbackStatus,
} from '../api/videos'
import { getProjectFiles } from '../api/projects'
import { getMe } from '../api/users'
import ActionMenu from './ActionMenu'
import { Avatar } from './Avatar'
import Modal from './Modal'
import TextArea from './TextArea'
import YouTubeIframePlayer from './YouTubeIframePlayer'
import type { VideoDetail, VideoListItem } from '../types/video'
import type { Feedback, FeedbackReply } from '../types/feedback'
import type { ReferenceFile } from '../types/video'
import type { ProjectFileListItem } from '../types/file'
import chevronDownIcon from '../assets/icons/chevron-down.svg?raw'
import commentCheckIcon from '../assets/icons/comment-check.svg?raw'
import documentIcon from '../assets/icons/document.svg?raw'
import downloadIcon from '../assets/icons/download.svg?raw'
import searchIcon from '../assets/icons/search.svg?raw'

function InlineIcon({ svg, className }: { svg: string; className: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 [&_svg]:block [&_svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

type VideoFeedbackTabProps = {
  projectId: number
}

type FeedbackFilter = 'all' | 'unresolved'

function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
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
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function VideoFeedbackTab({ projectId }: VideoFeedbackTabProps) {
  const [meId, setMeId] = useState<number | null>(null)
  const [videos, setVideos] = useState<VideoListItem[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)

  useEffect(() => {
    getMe()
      .then((me) => setMeId(me.id))
      .catch(() => setMeId(null))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setVideosLoading(true)
      try {
        const result = await getVideos(projectId)
        if (!cancelled) setVideos(result.videos)
      } finally {
        if (!cancelled) setVideosLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  if (selectedVideoId !== null) {
    return (
      <VideoDetailView
        projectId={projectId}
        videoId={selectedVideoId}
        meId={meId}
        onBack={() => setSelectedVideoId(null)}
      />
    )
  }

  return (
    <section className="flex flex-col gap-3">
      {videosLoading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}
      {!videosLoading && videos.length === 0 && (
        <p className="text-caption-lg text-neutral-6">등록된 영상이 없습니다.</p>
      )}
      {!videosLoading && videos.length > 0 && (
        <ul className="border-border divide-border divide-y border-y">
          {videos.map((video) => (
            <li key={video.videoId}>
              <button
                type="button"
                onClick={() => setSelectedVideoId(video.videoId)}
                className="hover:bg-neutral-2 flex w-full items-center justify-between gap-3 px-1 py-4 text-left"
              >
                <span className="text-body-sm text-neutral-11 font-medium">{video.title}</span>
                <span className="text-caption-lg text-neutral-6 shrink-0">
                  {video.progressStatus === 'DONE' ? '완료' : '진행중'}
                  {video.unreadCommentCount > 0 ? ` · 안읽음 ${video.unreadCommentCount}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type VideoDetailViewProps = {
  projectId: number
  videoId: number
  meId: number | null
  onBack: () => void
}

function VideoDetailView({ projectId, videoId, meId, onBack }: VideoDetailViewProps) {
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null)
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FeedbackFilter>('all')
  const [newFeedback, setNewFeedback] = useState('')
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null)
  const [repliesByFeedback, setRepliesByFeedback] = useState<Record<number, FeedbackReply[]>>({})
  const [newReply, setNewReply] = useState('')
  const [fileSearch, setFileSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFileListItem[]>([])

  const playerRef = useRef<YT.Player | null>(null)
  const playerWrapperRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [detail, refFiles, feedbackPage] = await Promise.all([
          getVideo(projectId, videoId),
          getReferenceFiles(videoId),
          getFeedbacks(videoId),
        ])
        if (cancelled) return
        setVideoDetail(detail)
        setReferenceFiles(refFiles.items)
        setFeedbacks(feedbackPage.items)
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

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const target = fraction * duration
    playerRef.current?.seekTo(target, true)
    setCurrentTime(target)
  }

  const attachCurrentTime = () => {
    setPendingTimestamp(Math.floor(currentTime))
  }

  const submitFeedback = async () => {
    if (!newFeedback.trim()) return
    const created = await createFeedback(videoId, {
      content: newFeedback.trim(),
      timestampSec: pendingTimestamp ?? undefined,
    })
    setFeedbacks((prev) => [created, ...prev])
    setNewFeedback('')
    setPendingTimestamp(null)
  }

  const toggleResolved = async (feedback: Feedback) => {
    const nextStatus = feedback.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED'
    const updated = await updateFeedbackStatus(feedback.feedbackId, { status: nextStatus })
    setFeedbacks((prev) => prev.map((f) => (f.feedbackId === updated.feedbackId ? updated : f)))
  }

  const removeFeedback = async (feedbackId: number) => {
    await deleteFeedback(feedbackId)
    setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== feedbackId))
  }

  const toggleReplies = async (feedbackId: number) => {
    if (expandedFeedbackId === feedbackId) {
      setExpandedFeedbackId(null)
      return
    }
    setExpandedFeedbackId(feedbackId)
    if (!repliesByFeedback[feedbackId]) {
      const page = await getReplies(feedbackId)
      setRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: page.items }))
    }
  }

  const submitReply = async (feedbackId: number) => {
    if (!newReply.trim()) return
    const created = await createReply(feedbackId, { content: newReply.trim() })
    setRepliesByFeedback((prev) => ({
      ...prev,
      [feedbackId]: [...(prev[feedbackId] ?? []), created],
    }))
    setNewReply('')
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

  const filteredFeedbacks = feedbacks.filter((f) =>
    filter === 'unresolved' ? f.status !== 'RESOLVED' : true,
  )
  const filteredFiles = referenceFiles.filter((f) =>
    f.fileName.toLowerCase().includes(fileSearch.toLowerCase()),
  )

  if (loading || !videoDetail) {
    return <p className="text-body-sm text-neutral-6">불러오는 중…</p>
  }

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-body-sm text-neutral-11 w-fit font-semibold"
      >
        {'< 영상 목록'}
      </button>

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
                <span className="rounded-full bg-black/40 px-3 py-1 text-caption-sm">
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
            <h2 className="text-head-sm text-neutral-9 font-semibold">프로젝트 소개</h2>
            {videoDetail.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {videoDetail.categories.map((category) => (
                  <span
                    key={category}
                    className="bg-tag-role-bg text-tag-role-text text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
                  >
                    {category}
                  </span>
                ))}
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
                className="bg-bg-primary border-neutral-5 flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
                  <span className="text-body-sm text-neutral-11 truncate">{file.fileName}</span>
                </div>
                <InlineIcon svg={downloadIcon} className="text-neutral-9 size-4 shrink-0" />
              </div>
            ))}
            <button
              type="button"
              onClick={openPicker}
              className="border-primary text-primary hover:bg-primary/5 w-full rounded-lg border py-2 text-body-sm font-semibold"
            >
              파일 추가하기
            </button>
          </div>
        </div>

        <div className="flex w-full min-h-[144px] flex-col gap-4 lg:h-[calc(100vh-140px)] lg:w-[300px] lg:shrink-0 lg:sticky lg:top-6">
          <div className="flex shrink-0 items-center gap-2">
            <h2 className="text-head-sm text-neutral-11 font-semibold">피드백</h2>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold ${
                filter === 'all' ? 'bg-success-light text-success-dark' : 'bg-neutral-3 text-neutral-6'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setFilter('unresolved')}
              className={`text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold ${
                filter === 'unresolved' ? 'bg-success-light text-success-dark' : 'bg-neutral-3 text-neutral-6'
              }`}
            >
              해결 안됨
            </button>
          </div>

          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {filteredFeedbacks.map((feedback) => {
              const isMine = meId !== null && feedback.actor.type === 'USER' && feedback.actor.id === meId
              const isResolved = feedback.status === 'RESOLVED'
              return (
                <li key={feedback.feedbackId} className="border-neutral-3 flex flex-col gap-2 border-b pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar alt={feedback.actor.name} size={22} fallback={feedback.actor.name.slice(0, 1)} />
                      {feedback.timestampSec !== null && (
                        <button
                          type="button"
                          onClick={() => playerRef.current?.seekTo(feedback.timestampSec ?? 0, true)}
                          className="text-caption-sm text-primary font-bold underline"
                        >
                          {formatTimestamp(feedback.timestampSec)}
                        </button>
                      )}
                      <span className="text-caption-sm text-neutral-9 font-medium">{feedback.actor.name}</span>
                      <span
                        className={`size-[9px] rounded-full ${isResolved ? 'bg-success' : 'bg-warning'}`}
                        aria-hidden
                      />
                    </div>
                    {isMine && (
                      <ActionMenu
                        items={[
                          { label: '삭제하기', onClick: () => removeFeedback(feedback.feedbackId), danger: true },
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
                      답글{repliesByFeedback[feedback.feedbackId]?.length ? ` ${repliesByFeedback[feedback.feedbackId].length}` : ''}
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
                          <Avatar alt={reply.actor.name} size={18} fallback={reply.actor.name.slice(0, 1)} />
                          <div className="flex flex-col">
                            <span className="text-caption-sm text-neutral-9 font-semibold">{reply.actor.name}</span>
                            <span className="text-caption-lg text-neutral-10">{reply.content}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="답글 남기기"
                          className="border-neutral-3 text-caption-lg flex-1 rounded-md border px-2 py-1 outline-none"
                        />
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
                  )}
                </li>
              )
            })}
          </ul>

          <div className="border-neutral-5 flex shrink-0 flex-col gap-2 rounded-lg border p-3">
            <button
              type="button"
              onClick={attachCurrentTime}
              className="border-neutral-5 text-neutral-9 flex w-fit items-center gap-1 rounded-lg border px-2 py-1.5 text-caption-sm"
            >
              <ClockIcon />
              {pendingTimestamp !== null ? formatTimestamp(pendingTimestamp) : '현재 위치'}
            </button>
            <TextArea value={newFeedback} onChange={setNewFeedback} placeholder="피드백을 입력하세요" rows={3} />
            <button
              type="button"
              onClick={submitFeedback}
              disabled={!newFeedback.trim()}
              className="bg-primary disabled:bg-neutral-3 flex size-7 items-center justify-center self-end rounded-full text-white"
              aria-label="전송"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                <path d="M1 8l13-6-4 6 4 6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)}>
        <div className="bg-bg-primary flex w-[420px] flex-col gap-3 rounded-lg p-5">
          <h3 className="text-body-sm text-neutral-11 font-semibold">참고 파일로 연결할 파일 선택</h3>
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
              <p className="text-caption-lg text-neutral-6">연결할 수 있는 프로젝트 파일이 없습니다.</p>
            )}
          </ul>
        </div>
      </Modal>
    </section>
  )
}
