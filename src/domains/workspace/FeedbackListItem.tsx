import { Avatar } from '../../components/Avatar'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import InlineIcon from '../../components/InlineIcon'
import TextArea from '../../components/TextArea'
import type { Feedback, FeedbackReply } from '../../types/feedback'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import commentCheckIcon from '../../assets/icons/comment-check.svg?raw'
import FeedbackReplies from './FeedbackReplies'
import { FeedbackTimeLink } from './videoDetailShared'

type FeedbackListItemProps = {
  feedback: Feedback
  isMine: boolean
  onSeek: (seconds: number) => void
  onEdit: () => void
  onRemove: () => void
  onToggleResolved: () => void
  isEditing: boolean
  editingContent: string
  onEditingContentChange: (value: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  isExpanded: boolean
  onToggleReplies: () => void
  replies: FeedbackReply[]
  newReply: string
  setNewReply: (value: string) => void
  replyPendingStart: number | null
  replyPendingEnd: number | null
  isCapturingReplyRange: boolean
  clearReplyPendingTime: () => void
  attachReplyCurrentTime: () => void
  toggleReplyRangeCapture: () => void
  onSubmitReply: () => void
}

export default function FeedbackListItem({
  feedback,
  isMine,
  onSeek,
  onEdit,
  onRemove,
  onToggleResolved,
  isEditing,
  editingContent,
  onEditingContentChange,
  onCancelEdit,
  onSaveEdit,
  isExpanded,
  onToggleReplies,
  replies,
  newReply,
  setNewReply,
  replyPendingStart,
  replyPendingEnd,
  isCapturingReplyRange,
  clearReplyPendingTime,
  attachReplyCurrentTime,
  toggleReplyRangeCapture,
  onSubmitReply,
}: FeedbackListItemProps) {
  const isResolved = feedback.status

  return (
    <li className="border-neutral-3 flex flex-col gap-2 border-b pb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar alt={feedback.actor.name} size={22} fallback={feedback.actor.name.slice(0, 1)} />
          <FeedbackTimeLink
            feedback={feedback}
            onSeek={onSeek}
            className="text-caption-sm text-primary font-bold underline"
          />
          <span className="text-caption-sm text-neutral-9 font-medium">{feedback.actor.name}</span>
          <span
            className={`size-[9px] rounded-full ${isResolved ? 'bg-success' : 'bg-warning'}`}
            aria-hidden
          />
        </div>
        {isMine && (
          <ActionMenu
            items={[
              { action: 'edit', onClick: onEdit },
              { action: 'delete', onClick: onRemove },
            ]}
          />
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <TextArea value={editingContent} onChange={onEditingContentChange} rows={2} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancelEdit} className="w-20">
              취소
            </Button>
            <Button variant="primary" size="sm" onClick={onSaveEdit} className="w-20">
              저장
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-caption-lg text-neutral-10">{feedback.content}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onToggleReplies}
          className="text-caption-sm text-neutral-9 flex items-center gap-1 font-semibold"
        >
          답글
          {replies.length ? ` ${replies.length}` : ''}
          <InlineIcon
            svg={chevronDownIcon}
            className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={onToggleResolved}
          aria-pressed={isResolved}
          aria-label="해결 처리"
          className={isResolved ? 'text-success' : 'text-neutral-5'}
        >
          <InlineIcon svg={commentCheckIcon} className="size-4" />
        </button>
      </div>

      {isExpanded && (
        <FeedbackReplies
          replies={replies}
          onSeek={onSeek}
          newReply={newReply}
          setNewReply={setNewReply}
          replyPendingStart={replyPendingStart}
          replyPendingEnd={replyPendingEnd}
          isCapturingReplyRange={isCapturingReplyRange}
          clearReplyPendingTime={clearReplyPendingTime}
          attachReplyCurrentTime={attachReplyCurrentTime}
          toggleReplyRangeCapture={toggleReplyRangeCapture}
          onSubmitReply={onSubmitReply}
        />
      )}
    </li>
  )
}
