import { memo } from 'react'
import { Button } from '../../components/Button'
import InlineIcon from '../../components/InlineIcon'
import TextArea from '../../components/TextArea'
import type { useFeedbacks } from '../../hooks/useFeedbacks'
import type { useFeedbackReplies } from '../../hooks/useFeedbackReplies'
import { CARD_BASE } from '../../styles/card'
import clockIcon from '../../assets/icons/clock.svg?raw'
import paperPlaneIcon from '../../assets/icons/paper-plane.svg?raw'
import xIcon from '../../assets/icons/x.svg?raw'
import FeedbackListItem from './FeedbackListItem'
import { formatPendingTime } from './videoDetailFormat'

type FeedbackPanelProps = Pick<
  ReturnType<typeof useFeedbacks>,
  | 'filteredFeedbacks'
  | 'hasMoreFeedbacks'
  | 'isLoadingMoreFeedbacks'
  | 'loadMoreFeedbacks'
  | 'filter'
  | 'setFilter'
  | 'newFeedback'
  | 'setNewFeedback'
  | 'pendingStart'
  | 'pendingEnd'
  | 'isCapturingRange'
  | 'editingFeedbackId'
  | 'editingFeedbackContent'
  | 'isSubmittingFeedback'
  | 'pendingFeedbackActionId'
  | 'setEditingFeedbackContent'
  | 'clearPendingTime'
  | 'attachCurrentTime'
  | 'toggleRangeCapture'
  | 'submitFeedback'
  | 'toggleResolved'
  | 'removeFeedback'
  | 'startEditFeedback'
  | 'cancelEditFeedback'
  | 'saveEditFeedback'
> &
  Pick<
    ReturnType<typeof useFeedbackReplies>,
    | 'expandedFeedbackId'
    | 'repliesByFeedback'
    | 'hasMoreRepliesByFeedback'
    | 'isLoadingMoreRepliesByFeedback'
    | 'newReply'
    | 'setNewReply'
    | 'editingReplyId'
    | 'editingReplyContent'
    | 'setEditingReplyContent'
    | 'isSubmittingReply'
    | 'pendingReplyActionId'
    | 'toggleReplies'
    | 'loadMoreReplies'
    | 'submitReply'
    | 'startEditReply'
    | 'cancelEditReply'
    | 'saveEditReply'
    | 'removeReply'
  > & {
    meId: number | null
    guestId?: number
    onSeek: (seconds: number) => void
  }

export default memo(function FeedbackPanel({
  filteredFeedbacks,
  hasMoreFeedbacks,
  isLoadingMoreFeedbacks,
  loadMoreFeedbacks,
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
  clearPendingTime,
  attachCurrentTime,
  toggleRangeCapture,
  submitFeedback,
  toggleResolved,
  removeFeedback,
  startEditFeedback,
  cancelEditFeedback,
  saveEditFeedback,
  expandedFeedbackId,
  repliesByFeedback,
  hasMoreRepliesByFeedback,
  isLoadingMoreRepliesByFeedback,
  newReply,
  setNewReply,
  editingReplyId,
  editingReplyContent,
  setEditingReplyContent,
  isSubmittingReply,
  pendingReplyActionId,
  toggleReplies,
  loadMoreReplies,
  submitReply,
  startEditReply,
  cancelEditReply,
  saveEditReply,
  removeReply,
  meId,
  guestId,
  onSeek,
}: FeedbackPanelProps) {
  return (
    <div
      className={`flex min-h-[144px] w-full min-w-0 flex-col gap-4 overflow-x-hidden ${CARD_BASE} p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-140px)] lg:w-[340px] lg:shrink-0`}
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

      <ul className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto">
        {filteredFeedbacks.map((feedback) => {
          const isMine =
            (feedback.actor.type === 'USER' && meId !== null && feedback.actor.id === meId) ||
            (feedback.actor.type === 'GUEST' && guestId != null && feedback.actor.id === guestId)
          return (
            <FeedbackListItem
              key={feedback.feedbackId}
              feedback={feedback}
              isMine={isMine}
              isActionPending={pendingFeedbackActionId === feedback.feedbackId}
              canResolve={meId !== null}
              onSeek={onSeek}
              onEdit={() => startEditFeedback(feedback)}
              onRemove={() => void removeFeedback(feedback.feedbackId)}
              onToggleResolved={() => {
                if (meId == null) return
                void toggleResolved(feedback)
              }}
              isEditing={editingFeedbackId === feedback.feedbackId}
              editingContent={editingFeedbackContent}
              onEditingContentChange={setEditingFeedbackContent}
              onCancelEdit={cancelEditFeedback}
              onSaveEdit={() => void saveEditFeedback(feedback.feedbackId)}
              isExpanded={expandedFeedbackId === feedback.feedbackId}
              onToggleReplies={() => toggleReplies(feedback.feedbackId)}
              replies={repliesByFeedback[feedback.feedbackId]}
              hasMoreReplies={hasMoreRepliesByFeedback[feedback.feedbackId] ?? false}
              isLoadingMoreReplies={isLoadingMoreRepliesByFeedback[feedback.feedbackId] ?? false}
              onLoadMoreReplies={() => void loadMoreReplies(feedback.feedbackId)}
              newReply={newReply}
              setNewReply={setNewReply}
              onSubmitReply={() => void submitReply(feedback.feedbackId)}
              meId={meId}
              guestId={guestId}
              editingReplyId={editingReplyId}
              editingReplyContent={editingReplyContent}
              isSubmittingReply={isSubmittingReply}
              pendingReplyActionId={pendingReplyActionId}
              onEditingReplyContentChange={setEditingReplyContent}
              onEditReply={startEditReply}
              onCancelEditReply={cancelEditReply}
              onSaveEditReply={(replyId) => void saveEditReply(feedback.feedbackId, replyId)}
              onRemoveReply={(replyId) => void removeReply(feedback.feedbackId, replyId)}
            />
          )
        })}
      </ul>

      {hasMoreFeedbacks && (
        <div className="flex shrink-0 justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadMoreFeedbacks()}
            disabled={isLoadingMoreFeedbacks}
          >
            {isLoadingMoreFeedbacks ? '불러오는 중…' : '더 보기'}
          </Button>
        </div>
      )}

      <div className="border-neutral-5 flex shrink-0 flex-col gap-2 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={attachCurrentTime}
            aria-label="현재 위치 기록"
            className={`border-neutral-5 flex size-10 items-center justify-center rounded-lg border ${
              pendingStart !== null && pendingEnd === null && !isCapturingRange
                ? 'border-primary text-primary'
                : 'text-neutral-9'
            }`}
          >
            <InlineIcon svg={clockIcon} className="pointer-events-none size-5" />
          </button>
          <button
            type="button"
            onClick={toggleRangeCapture}
            aria-label="구간 기록"
            title={isCapturingRange ? '종료 지점 기록' : '구간 기록'}
            className={`border-neutral-5 flex h-10 items-center rounded-lg border px-3 ${
              isCapturingRange || pendingEnd !== null
                ? 'border-primary text-primary'
                : 'text-neutral-9'
            }`}
          >
            <InlineIcon svg={clockIcon} className="pointer-events-none size-5" />
            <span aria-hidden className="mx-0.5 h-0.5 w-3 bg-current" />
            <InlineIcon svg={clockIcon} className="pointer-events-none size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {formatPendingTime(pendingStart, pendingEnd) && (
            <div className="text-caption-lg text-primary flex items-center gap-1 font-bold">
              <span>{formatPendingTime(pendingStart, pendingEnd)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  clearPendingTime()
                }}
                aria-label="시간 첨부 취소"
                className="text-neutral-5 hover:text-neutral-7 inline-flex size-8 items-center justify-center rounded-md"
              >
                <InlineIcon svg={xIcon} className="pointer-events-none size-3.5" />
              </button>
            </div>
          )}
          <TextArea
            value={newFeedback}
            onChange={setNewFeedback}
            placeholder="피드백을 입력하세요"
            rows={3}
          />
        </div>
        <button
          type="button"
          onClick={submitFeedback}
          disabled={!newFeedback.trim() || isSubmittingFeedback}
          className="bg-primary disabled:bg-neutral-3 flex size-9 items-center justify-center self-end rounded-full text-white"
          aria-label="전송"
        >
          <InlineIcon svg={paperPlaneIcon} className="pointer-events-none size-4" />
        </button>
      </div>
    </div>
  )
})
