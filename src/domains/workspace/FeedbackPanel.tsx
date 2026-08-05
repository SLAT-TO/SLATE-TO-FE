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
  | 'filter'
  | 'setFilter'
  | 'newFeedback'
  | 'setNewFeedback'
  | 'pendingStart'
  | 'pendingEnd'
  | 'isCapturingRange'
  | 'editingFeedbackId'
  | 'editingFeedbackContent'
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
    | 'newReply'
    | 'setNewReply'
    | 'replyPendingStart'
    | 'replyPendingEnd'
    | 'isCapturingReplyRange'
    | 'toggleReplies'
    | 'clearReplyPendingTime'
    | 'attachReplyCurrentTime'
    | 'toggleReplyRangeCapture'
    | 'submitReply'
  > & {
    meId: number | null
    onSeek: (seconds: number) => void
  }

export default function FeedbackPanel({
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
  newReply,
  setNewReply,
  replyPendingStart,
  replyPendingEnd,
  isCapturingReplyRange,
  toggleReplies,
  clearReplyPendingTime,
  attachReplyCurrentTime,
  toggleReplyRangeCapture,
  submitReply,
  meId,
  onSeek,
}: FeedbackPanelProps) {
  return (
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
          return (
            <FeedbackListItem
              key={feedback.feedbackId}
              feedback={feedback}
              isMine={isMine}
              canResolve={meId !== null}
              onSeek={onSeek}
              onEdit={() => startEditFeedback(feedback)}
              onRemove={() => removeFeedback(feedback.feedbackId)}
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
              replies={repliesByFeedback[feedback.feedbackId] ?? []}
              newReply={newReply}
              setNewReply={setNewReply}
              replyPendingStart={replyPendingStart}
              replyPendingEnd={replyPendingEnd}
              isCapturingReplyRange={isCapturingReplyRange}
              clearReplyPendingTime={clearReplyPendingTime}
              attachReplyCurrentTime={attachReplyCurrentTime}
              toggleReplyRangeCapture={toggleReplyRangeCapture}
              onSubmitReply={() => submitReply(feedback.feedbackId)}
            />
          )
        })}
      </ul>

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
          disabled={!newFeedback.trim()}
          className="bg-primary disabled:bg-neutral-3 flex size-9 items-center justify-center self-end rounded-full text-white"
          aria-label="전송"
        >
          <InlineIcon svg={paperPlaneIcon} className="pointer-events-none size-4" />
        </button>
      </div>
    </div>
  )
}
