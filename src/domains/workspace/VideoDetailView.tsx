import { useEffect, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import Modal from '../../components/Modal'
import EditVideoModal from './EditVideoModal'
import VideoDetailHeader from './VideoDetailHeader'
import VideoPlayerSection from './VideoPlayerSection'
import ProjectIntroSection from './ProjectIntroSection'
import ReferenceFilesSection from './ReferenceFilesSection'
import FeedbackPanel from './FeedbackPanel'
import { formatDate } from './videoDetailFormat'
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer'
import { useVideoDetail } from '../../hooks/useVideoDetail'
import { useReferenceFiles } from '../../hooks/useReferenceFiles'
import { useFeedbacks } from '../../hooks/useFeedbacks'
import { useFeedbackReplies } from '../../hooks/useFeedbackReplies'
import { useProjectMembersInvite } from '../../hooks/useProjectMembersInvite'
import { getGuestVideoDetail } from '../../api/videos'
import { ApiError } from '../../types/api'
import type { ProjectStatus } from '../../types/project'
import type { GuestVideoDetail } from '../../types/video'

/** 공유 링크로 들어온 게스트 신원 — 있으면 멤버 전용 데이터(참고파일·참여인원·수정·삭제 등)는 걷어내고 영상+피드백만 보여준다 */
export type VideoGuestContext = {
  shareToken: string
  guestId: number
  guestToken: string
  /** 게스트 등록 직후 진입 시, 영상 상세 로딩이 끝나기 전 헤더에 잠깐 보여줄 제목 */
  initialTitle?: string
}

export type VideoDetailViewProps = {
  videoId: number
  onBack: () => void
  guest?: VideoGuestContext
  /** guest가 없을 때(멤버 모드)만 실제로 쓰인다 */
  projectId?: number
  meId?: number | null
  isAdmin?: boolean
  projectStatus?: ProjectStatus
  onProjectStatusChange?: (status: ProjectStatus) => void
}

export function VideoDetailView({
  videoId,
  onBack,
  guest,
  projectId,
  meId = null,
  isAdmin = false,
  projectStatus,
  onProjectStatusChange,
}: VideoDetailViewProps) {
  const isGuest = guest != null
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [guestVideoDetail, setGuestVideoDetail] = useState<GuestVideoDetail | null>(null)

  const {
    playerWrapperRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    getCurrentTime,
    handlePlayerReady,
    handleStateChange,
    togglePlay,
    toggleMute,
    seekTo,
    handleSeekClick,
  } = useYouTubePlayer()

  const {
    videoDetail,
    load: loadVideoDetail,
    toggleBookmark,
    confirmDeleteVideo,
    handleUpdateVideo,
  } = useVideoDetail(projectId ?? 0, videoId, onBack)

  const {
    filteredFiles,
    fileSearch,
    setFileSearch,
    pickerOpen,
    setPickerOpen,
    projectFiles,
    load: loadReferenceFiles,
    openPicker,
    attachFile,
    removeReferenceFile,
    downloadReferenceFile,
    hasMoreReferenceFiles,
    isLoadingMoreReferenceFiles,
    loadMoreReferenceFiles,
  } = useReferenceFiles(
    projectId ?? 0,
    videoId,
    guest?.shareToken,
    guest?.guestId,
    guest?.guestToken,
  )

  const {
    filteredFeedbacks,
    filter,
    setFilter,
    newFeedback,
    setNewFeedback,
    pendingStart,
    pendingEnd,
    isCapturingRange,
    editingFeedbackId,
    editingFeedbackContent,
    isSubmittingFeedback,
    pendingFeedbackActionId,
    setEditingFeedbackContent,
    load: loadFeedbacks,
    clearPendingTime,
    attachCurrentTime,
    toggleRangeCapture,
    submitFeedback,
    toggleResolved,
    removeFeedback,
    startEditFeedback,
    cancelEditFeedback,
    saveEditFeedback,
  } = useFeedbacks(
    videoId,
    getCurrentTime,
    guest?.guestId,
    isGuest ? undefined : projectId,
    guest?.guestToken,
  )

  const {
    expandedFeedbackId,
    repliesByFeedback,
    newReply,
    setNewReply,
    editingReplyId,
    editingReplyContent,
    setEditingReplyContent,
    isSubmittingReply,
    pendingReplyActionId,
    toggleReplies,
    submitReply,
    startEditReply,
    cancelEditReply,
    saveEditReply,
    removeReply,
  } = useFeedbackReplies(guest?.guestId, isGuest ? undefined : projectId, guest?.guestToken)

  const { members, setMembers, load: loadMembers } = useProjectMembersInvite(projectId ?? 0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        if (guest) {
          const detail = await getGuestVideoDetail(guest.shareToken, {
            guestId: guest.guestId,
            guestToken: guest.guestToken,
          })
          if (cancelled) return
          setGuestVideoDetail(detail)
          await Promise.all([
            loadReferenceFiles().catch(() => {}),
            loadFeedbacks().catch(() => {
              if (!cancelled) window.alert('피드백을 불러오지 못했습니다.')
            }),
          ])
          return
        }

        // 영상 본문만 필수 — 참고파일·피드백·멤버는 실패해도 상세 유지
        await loadVideoDetail()
        if (cancelled) return
        await Promise.all([
          // 참고파일 API 부재/빈 응답은 빈 목록으로 취급
          loadReferenceFiles().catch(() => {}),
          loadFeedbacks().catch(() => {
            if (!cancelled) window.alert('피드백을 불러오지 못했습니다.')
          }),
          loadMembers().catch(() => {
            if (!cancelled) window.alert('참여 인원을 불러오지 못했습니다.')
          }),
        ])
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : '영상 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [guest, projectId, videoId, loadVideoDetail, loadReferenceFiles, loadFeedbacks, loadMembers])

  // 멤버/게스트 두 응답 shape을 화면에 필요한 필드만으로 통일
  const title = isGuest ? (guestVideoDetail?.title ?? guest?.initialTitle) : videoDetail?.title
  const youtubeUrl = isGuest ? guestVideoDetail?.youtubeUrl : videoDetail?.youtubeUrl
  const projectTags = isGuest
    ? (guestVideoDetail?.projectTags ?? [])
    : (videoDetail?.projectTags ?? [])
  const memo = isGuest ? (guestVideoDetail?.memo ?? null) : (videoDetail?.memo ?? null)
  const createdAt = isGuest ? guestVideoDetail?.createdAt : videoDetail?.createdAt
  const updatedAt = isGuest ? guestVideoDetail?.updatedAt : videoDetail?.updatedAt
  const hasDetail = isGuest ? guestVideoDetail != null : videoDetail != null

  const headerSlot = isGuest ? (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-head-sm text-neutral-11 font-bold">{title ?? '영상 피드백'}</h1>
    </div>
  ) : (
    <VideoDetailHeader
      projectId={projectId ?? 0}
      videoDetail={videoDetail}
      toggleBookmark={toggleBookmark}
      projectStatus={projectStatus ?? 'PREPARING'}
      onProjectStatusChange={onProjectStatusChange ?? (() => {})}
      members={members}
      isAdmin={isAdmin}
      meId={meId}
      onMembersChange={setMembers}
      onEdit={() => setEditOpen(true)}
      onDelete={() => setDeleteOpen(true)}
    />
  )

  if (loading) {
    return (
      <>
        {headerSlot}
        <p className="text-body-sm text-neutral-6">불러오는 중…</p>
      </>
    )
  }

  if (loadError || !hasDetail || !youtubeUrl) {
    return (
      <section className="flex flex-col gap-3">
        {headerSlot}
        {!isGuest && (
          <button
            type="button"
            onClick={onBack}
            className="text-body-sm text-neutral-11 w-fit font-semibold"
          >
            {'< 영상 목록'}
          </button>
        )}
        <p className="text-body-sm text-warning">{loadError ?? '영상을 찾을 수 없습니다.'}</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      {headerSlot}
      {createdAt && updatedAt && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-caption-lg text-neutral-6">생성일 {formatDate(createdAt)}</span>
          <span className="text-caption-lg text-neutral-6">수정일 {formatDate(updatedAt)}</span>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <VideoPlayerSection
            playerWrapperRef={playerWrapperRef}
            youtubeUrl={youtubeUrl}
            title={title ?? ''}
            isPlaying={isPlaying}
            isMuted={isMuted}
            currentTime={currentTime}
            duration={duration}
            handlePlayerReady={handlePlayerReady}
            handleStateChange={handleStateChange}
            togglePlay={togglePlay}
            toggleMute={toggleMute}
            handleSeekClick={handleSeekClick}
          />

          <ProjectIntroSection projectTags={projectTags} memo={memo} />

          <ReferenceFilesSection
            filteredFiles={filteredFiles}
            fileSearch={fileSearch}
            setFileSearch={setFileSearch}
            downloadReferenceFile={downloadReferenceFile}
            removeReferenceFile={removeReferenceFile}
            openPicker={openPicker}
            hasMoreReferenceFiles={hasMoreReferenceFiles}
            isLoadingMoreReferenceFiles={isLoadingMoreReferenceFiles}
            loadMoreReferenceFiles={loadMoreReferenceFiles}
            readOnly={isGuest}
          />
        </div>

        <FeedbackPanel
          filteredFeedbacks={filteredFeedbacks}
          filter={filter}
          setFilter={setFilter}
          newFeedback={newFeedback}
          setNewFeedback={setNewFeedback}
          pendingStart={pendingStart}
          pendingEnd={pendingEnd}
          isCapturingRange={isCapturingRange}
          editingFeedbackId={editingFeedbackId}
          editingFeedbackContent={editingFeedbackContent}
          isSubmittingFeedback={isSubmittingFeedback}
          pendingFeedbackActionId={pendingFeedbackActionId}
          setEditingFeedbackContent={setEditingFeedbackContent}
          clearPendingTime={clearPendingTime}
          attachCurrentTime={attachCurrentTime}
          toggleRangeCapture={toggleRangeCapture}
          submitFeedback={submitFeedback}
          toggleResolved={toggleResolved}
          removeFeedback={removeFeedback}
          startEditFeedback={startEditFeedback}
          cancelEditFeedback={cancelEditFeedback}
          saveEditFeedback={saveEditFeedback}
          expandedFeedbackId={expandedFeedbackId}
          repliesByFeedback={repliesByFeedback}
          newReply={newReply}
          setNewReply={setNewReply}
          editingReplyId={editingReplyId}
          editingReplyContent={editingReplyContent}
          setEditingReplyContent={setEditingReplyContent}
          isSubmittingReply={isSubmittingReply}
          pendingReplyActionId={pendingReplyActionId}
          toggleReplies={toggleReplies}
          submitReply={submitReply}
          startEditReply={startEditReply}
          cancelEditReply={cancelEditReply}
          saveEditReply={saveEditReply}
          removeReply={removeReply}
          meId={meId}
          guestId={guest?.guestId}
          onSeek={seekTo}
        />
      </div>

      {!isGuest && (
        <>
          <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)}>
            <div className="bg-bg-primary flex w-[calc(100vw-32px)] max-w-[420px] flex-col gap-3 rounded-lg p-5">
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

          <EditVideoModal
            key={editOpen ? `video-${videoId}-open` : 'video-edit-closed'}
            isOpen={editOpen}
            initialTitle={videoDetail?.title ?? ''}
            initialYoutubeUrl={videoDetail?.youtubeUrl ?? ''}
            initialMemo={videoDetail?.memo ?? ''}
            onClose={() => setEditOpen(false)}
            onSubmit={handleUpdateVideo}
          />
        </>
      )}
    </section>
  )
}
