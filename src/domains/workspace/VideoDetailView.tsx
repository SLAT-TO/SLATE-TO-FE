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
import { ApiError } from '../../types/api'
import type { ProjectLengthType, ProjectStatus } from '../../types/project'

export type VideoDetailViewProps = {
  projectId: number
  videoId: number
  meId: number | null
  isAdmin?: boolean
  lengthType: ProjectLengthType | null
  projectStatus: ProjectStatus
  onProjectStatusChange: (status: ProjectStatus) => void
  /** 이 프로젝트에서 내가 맡은 역할 — 프로젝트 소개글 태그 옆에 함께 표시 */
  myRoleNames?: string[]
  onBack: () => void
}

export function VideoDetailView({
  projectId,
  videoId,
  meId,
  isAdmin = false,
  lengthType,
  projectStatus,
  onProjectStatusChange,
  myRoleNames = [],
  onBack,
}: VideoDetailViewProps) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

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
  } = useVideoDetail(projectId, videoId, onBack)

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
  } = useReferenceFiles(projectId, videoId)

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
  } = useFeedbacks(videoId, getCurrentTime, undefined, projectId)

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
  } = useFeedbackReplies(undefined, projectId)

  const { members, setMembers, load: loadMembers } = useProjectMembersInvite(projectId)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
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
  }, [projectId, videoId, loadVideoDetail, loadReferenceFiles, loadFeedbacks, loadMembers])

  const headerSlot = (
    <VideoDetailHeader
      projectId={projectId}
      videoDetail={videoDetail}
      toggleBookmark={toggleBookmark}
      projectStatus={projectStatus}
      onProjectStatusChange={onProjectStatusChange}
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

  if (loadError || !videoDetail) {
    return (
      <section className="flex flex-col gap-3">
        {headerSlot}
        <button
          type="button"
          onClick={onBack}
          className="text-body-sm text-neutral-11 w-fit font-semibold"
        >
          {'< 영상 목록'}
        </button>
        <p className="text-body-sm text-warning">{loadError ?? '영상을 찾을 수 없습니다.'}</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      {headerSlot}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-caption-lg text-neutral-6">
          생성일 {formatDate(videoDetail.createdAt)}
        </span>
        <span className="text-caption-lg text-neutral-6">
          수정일 {formatDate(videoDetail.updatedAt)}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <VideoPlayerSection
            playerWrapperRef={playerWrapperRef}
            youtubeUrl={videoDetail.youtubeUrl}
            title={videoDetail.title}
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

          <ProjectIntroSection
            projectTags={videoDetail.projectTags}
            lengthType={lengthType}
            myRoleNames={myRoleNames}
            memo={videoDetail.memo}
          />

          <ReferenceFilesSection
            filteredFiles={filteredFiles}
            fileSearch={fileSearch}
            setFileSearch={setFileSearch}
            downloadReferenceFile={downloadReferenceFile}
            removeReferenceFile={removeReferenceFile}
            openPicker={openPicker}
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
          onSeek={seekTo}
        />
      </div>

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
    </section>
  )
}
